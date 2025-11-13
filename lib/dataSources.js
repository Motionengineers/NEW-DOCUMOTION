import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';

const DATA_ROOT = path.join(process.cwd(), 'data');
const PUBLIC_PITCH_DECK_ROOT = path.join(process.cwd(), 'public', 'uploads', 'PDF');
const cache = new Map();

async function readFileRelative(relativePath) {
  const filePath = path.join(DATA_ROOT, relativePath);
  return fs.readFile(filePath, 'utf8');
}

async function loadCsv(relativePath) {
  const csv = await readFileRelative(relativePath);
  const parsed = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });
  if (parsed.errors?.length) {
    console.warn(`CSV parse warnings for ${relativePath}:`, parsed.errors);
  }
  return parsed.data;
}

async function loadJson(relativePath) {
  const json = await readFileRelative(relativePath);
  return JSON.parse(json);
}

async function loadDataset(baseName) {
  const jsonPath = `${baseName}.json`;
  try {
    return await loadJson(jsonPath);
  } catch (error) {
    if (error.code && error.code !== 'ENOENT') {
      throw error;
    }
  }
  return loadCsv(`${baseName}.csv`);
}

async function cached(key, loader) {
  if (process.env.NODE_ENV !== 'production') {
    return loader();
  }

  if (!cache.has(key)) {
    cache.set(
      key,
      loader().catch(error => {
        cache.delete(key);
        throw error;
      })
    );
  }
  return cache.get(key);
}

export function loadGovtSchemes() {
  return cached('govtSchemes', () => loadDataset('govt_schemes_enhanced'));
}

export function loadBankSchemes() {
  return cached('bankSchemes', () => loadDataset('bank_schemes_enhanced'));
}

export function loadBankPrograms() {
  return cached('bankPrograms', () => loadDataset('bank_programs'));
}

export function loadStartupBanks() {
  return cached('startupBanks', async () => {
    const banks = await loadDataset('startup_banks');

    const SPECIALIZATION_WEIGHTS = new Map([
      ['api-first', 6],
      ['automation-suite', 5],
      ['accounting-integrations', 4],
      ['developer-tooling', 4],
      ['international-banking', 7],
      ['fdi-compliance', 5],
      ['global-network', 5],
      ['scaleup-lending', 5],
      ['credit-access', 6],
      ['cashflow-lending', 5],
      ['alternative-credit', 5],
      ['zero-balance-launch', 3],
      ['low-balance', 3],
      ['doorstep-onboarding', 3],
      ['relationship-led', 3],
      ['pan-india-network', 4],
      ['ecosystem-benefits', 3],
      ['fintech-co-creation', 4],
      ['merchant-focus', 3],
      ['sme-focus', 3],
    ]);

    const PLATFORM_WEIGHTS = new Map([
      ['JanSamarth Startup Common Application', 5],
      ['Startup Common Application', 5],
      ['Account Aggregator', 2],
      ['HSBC Innovation Banking', 3],
      ['YES Head-STARTUP', 3],
      ['FIRST Wings Hub', 2],
      ['RazorpayX Dashboard', 2],
      ['Open Money OS', 2],
      ['Paytm for Business', 2],
      ['SmartHub Vyapar', 2],
    ]);

    const SPECIALIZATION_BADGES = [
      {
        key: 'international-banking',
        label: 'Global expansion ready',
      },
      {
        key: 'api-first',
        label: 'API-native banking',
      },
      {
        key: 'automation-suite',
        label: 'Automation toolkit',
      },
      {
        key: 'credit-access',
        label: 'Credit-first partner',
      },
      {
        key: 'zero-balance-launch',
        label: 'Zero-balance launch',
      },
      {
        key: 'pan-india-network',
        label: 'Pan-India presence',
      },
      {
        key: 'alternative-credit',
        label: 'Cashflow underwriting',
      },
    ];

    const ranked = banks.map(bank => {
      const cityCount = new Set(bank.branches.map(branch => branch.city)).size;
      const schemeCoverage = bank.governmentSchemes?.length ?? 0;
      const specializations = Array.isArray(bank.specializations) ? bank.specializations : [];
      const platforms = Array.isArray(bank.platforms) ? bank.platforms : [];

      let score = 0;

      score += (bank.keyOfferings?.length ?? 0) * 3.5;
      score += bank.branches.length * 1.5;
      score += cityCount * 2;
      score += schemeCoverage * 3;
      if (bank.category === 'fintech') score += 5;

      specializations.forEach(spec => {
        const weight = SPECIALIZATION_WEIGHTS.get(spec) ?? 1.5;
        score += weight;
      });

      platforms.forEach(platform => {
        const weight = PLATFORM_WEIGHTS.get(platform) ?? 1;
        score += weight;
      });

      const badges = new Set();
      badges.add(bank.category === 'fintech' ? 'Fintech partner' : 'Full-service bank');
      badges.add(
        cityCount >= 8
          ? 'Pan-India coverage'
          : cityCount >= 4
            ? 'Metro coverage'
            : 'Focused coverage'
      );
      if (schemeCoverage >= 3) badges.add('Govt. programmes ready');
      else if (schemeCoverage >= 1) badges.add('Scheme assistance');

      SPECIALIZATION_BADGES.forEach(({ key, label }) => {
        if (specializations.includes(key)) {
          badges.add(label);
        }
      });

      if (
        platforms.includes('JanSamarth Startup Common Application') ||
        platforms.includes('Startup Common Application')
      ) {
        badges.add('JanSamarth enabled');
      }

      return {
        ...bank,
        cityCount,
        recommendationScore: Math.round(score * 10) / 10,
        badges: Array.from(badges).filter(Boolean),
        topBranches: bank.branches.slice(0, 3),
        focusAreas: specializations,
        platforms,
      };
    });

    ranked.sort((a, b) => b.recommendationScore - a.recommendationScore);
    return ranked;
  });
}

const EDUCATION_OPTIONS = ['Bachelor', 'Master', 'MBA', 'PhD', 'Certification'];
const LANGUAGE_OPTIONS = [
  'English',
  'Hindi',
  'Kannada',
  'Tamil',
  'Telugu',
  'Marathi',
  'Bengali',
  'Gujarati',
];
const AVAILABILITY_OPTIONS = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Fractional'];
const INDUSTRY_FALLBACK = ['SaaS', 'Fintech', 'Consumer', 'Healthcare', 'Deep Tech', 'Marketing'];
const TAG_OPTIONS = [
  'Open to relocation',
  'Portfolio available',
  'Mentor-ready',
  'Fractional OK',
  'Immediate joiner',
];
const SALARY_BANDS = [
  { min: 12, max: 18 },
  { min: 18, max: 24 },
  { min: 24, max: 36 },
  { min: 36, max: 48 },
  { min: 48, max: 60 },
  { min: 60, max: 75 },
];

function hashString(value) {
  if (!value) return 1;
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) + 1;
}

function createSeededGenerator(seed) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function pickOne(options, rng) {
  if (!options.length) return undefined;
  const index = Math.floor(rng() * options.length);
  return options[index];
}

function pickMultiple(options, rng, count) {
  const pool = [...options];
  const selection = [];
  for (let i = 0; i < count && pool.length; i += 1) {
    const index = Math.floor(rng() * pool.length);
    selection.push(pool.splice(index, 1)[0]);
  }
  return selection;
}

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean);
  }
  return String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function experienceLevelFromYears(years) {
  if (years < 3) return 'Junior';
  if (years < 6) return 'Mid';
  if (years < 11) return 'Senior';
  return 'Executive';
}

function enrichTalentProfile(profile, index) {
  const seedBase = profile.fullName || profile.email || profile.link || `profile-${index}`;
  const seed = hashString(seedBase);
  const rng = createSeededGenerator(seed);

  const skillsArray = normalizeList(profile.skills);
  const industries = normalizeList(profile.industry);
  const experienceYears = 1 + Math.floor(rng() * 18);
  const experienceLevel = experienceLevelFromYears(experienceYears);
  const languages = pickMultiple(LANGUAGE_OPTIONS, rng, 1 + Math.floor(rng() * 3)) || ['English'];
  const availability = pickOne(AVAILABILITY_OPTIONS, rng) || 'Full-time';
  const education = pickOne(EDUCATION_OPTIONS, rng) || 'Bachelor';
  const salaryBand = SALARY_BANDS[Math.floor(rng() * SALARY_BANDS.length)];
  const salaryRange = {
    min: salaryBand.min,
    max: salaryBand.max,
    currency: 'INR',
  };
  const lastActiveDaysAgo = Math.floor(rng() * 60);
  const tags = pickMultiple(TAG_OPTIONS, rng, Math.floor(rng() * 3));
  const rating = Number((3 + rng() * 2).toFixed(1));

  const locationParts = profile.location
    ? profile.location
        .split(',')
        .map(part => part.trim())
        .filter(Boolean)
    : [];
  const locationCity = locationParts[0] || '';
  const locationCountry = locationParts[locationParts.length - 1] || '';

  const searchIndex = [
    profile.fullName,
    profile.designation,
    profile.company,
    profile.location,
    skillsArray.join(' '),
    industries.join(' '),
    languages.join(' '),
    education,
    availability,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const augmentedIndustries = industries.length ? industries : [pickOne(INDUSTRY_FALLBACK, rng)];

  const lastActiveDate = new Date(Date.now() - lastActiveDaysAgo * 86400000);

  return {
    ...profile,
    id: `${seed}-${index}`,
    skillsArray,
    industry: augmentedIndustries[0] || profile.industry || '',
    industries: augmentedIndustries,
    languages,
    availability,
    education,
    experienceYears,
    experienceLevel,
    salaryRange,
    salaryLabel: `₹${salaryRange.min}L - ₹${salaryRange.max}L`,
    lastActiveDaysAgo,
    lastActiveDate: lastActiveDate.toISOString(),
    tags,
    rating,
    locationCity,
    locationCountry,
    searchIndex,
  };
}

function computeRelevanceScore(profile, query) {
  if (!query) return 0;
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return 0;

  let score = 0;
  const searchIndex = profile.searchIndex || '';
  terms.forEach(term => {
    if (profile.fullName?.toLowerCase().includes(term)) score += 10;
    if (profile.designation?.toLowerCase().includes(term)) score += 8;
    if (profile.company?.toLowerCase().includes(term)) score += 6;
    if (profile.location?.toLowerCase().includes(term)) score += 4;
    if (profile.skillsArray?.some(skill => skill.toLowerCase().includes(term))) score += 6;
    if (profile.industries?.some(ind => ind.toLowerCase().includes(term))) score += 4;
    if (searchIndex.includes(term)) score += 2;
  });

  // Recent activity bonus
  score += Math.max(0, 30 - (profile.lastActiveDaysAgo ?? 0));

  return score;
}

function matchesFilters(profile, filters = {}) {
  if (!filters || typeof filters !== 'object') return true;

  const lower = value => (value ? String(value).toLowerCase() : '');
  const arrayLower = values => (Array.isArray(values) ? values.map(item => lower(item)) : []);

  // Skills
  if (filters.skills && Array.isArray(filters.skills.values) && filters.skills.values.length) {
    const logic = (filters.skills.logic || 'AND').toUpperCase();
    const requested = arrayLower(filters.skills.values);
    const profileSkills = arrayLower(profile.skillsArray);
    if (logic === 'AND') {
      if (!requested.every(skill => profileSkills.includes(skill))) return false;
    } else {
      if (!requested.some(skill => profileSkills.includes(skill))) return false;
    }
  }

  // Experience
  if (filters.experienceYears) {
    const min = Number.isFinite(filters.experienceYears.min) ? filters.experienceYears.min : 0;
    const max = Number.isFinite(filters.experienceYears.max)
      ? filters.experienceYears.max
      : Infinity;
    if (profile.experienceYears < min || profile.experienceYears > max) return false;
  }
  if (Array.isArray(filters.experienceLevels) && filters.experienceLevels.length) {
    if (!filters.experienceLevels.includes(profile.experienceLevel)) return false;
  }

  // Education
  if (Array.isArray(filters.education) && filters.education.length) {
    if (!filters.education.map(lower).includes(lower(profile.education))) return false;
  }

  // Location
  if (Array.isArray(filters.locations) && filters.locations.length) {
    const haystack = [profile.location, profile.locationCity, profile.locationCountry]
      .map(lower)
      .filter(Boolean);
    const match = filters.locations
      .map(lower)
      .some(locationTerm => haystack.some(value => value.includes(locationTerm)));
    if (!match) return false;
  }

  // Languages
  if (Array.isArray(filters.languages) && filters.languages.length) {
    const profileLanguages = arrayLower(profile.languages);
    if (!filters.languages.map(lower).every(lang => profileLanguages.includes(lang))) return false;
  }

  // Availability
  if (Array.isArray(filters.availability) && filters.availability.length) {
    if (!filters.availability.includes(profile.availability)) return false;
  }

  // Industries
  if (Array.isArray(filters.industries) && filters.industries.length) {
    const profileIndustries = arrayLower(profile.industries);
    if (!filters.industries.map(lower).some(ind => profileIndustries.includes(ind))) return false;
  }

  // Salary expectation
  if (filters.salary) {
    const min = Number.isFinite(filters.salary.min) ? filters.salary.min : 0;
    const max = Number.isFinite(filters.salary.max) ? filters.salary.max : Infinity;
    const range = profile.salaryRange ?? { min: 0, max: 0 };
    if (range.max < min || range.min > max) return false;
  }

  // Last active
  if (filters.lastActive && Number.isFinite(filters.lastActive.withinDays)) {
    if ((profile.lastActiveDaysAgo ?? Infinity) > filters.lastActive.withinDays) return false;
  }

  // Tags
  if (Array.isArray(filters.tags) && filters.tags.length) {
    const profileTags = arrayLower(profile.tags);
    if (!filters.tags.map(lower).every(tag => profileTags.includes(tag))) return false;
  }

  return true;
}

function incrementCount(map, key) {
  if (!key) return;
  const normalized = String(key).trim();
  if (!normalized) return;
  map.set(normalized, (map.get(normalized) ?? 0) + 1);
}

function collectFacetCounts(profiles) {
  const counts = {
    skills: new Map(),
    locations: new Map(),
    industries: new Map(),
    languages: new Map(),
    availability: new Map(),
    experienceLevels: new Map(),
    education: new Map(),
    tags: new Map(),
  };

  profiles.forEach(profile => {
    profile.skillsArray?.forEach(skill => incrementCount(counts.skills, skill));
    if (profile.locationCity) {
      incrementCount(counts.locations, profile.locationCity);
    } else {
      incrementCount(counts.locations, profile.location);
    }
    profile.industries?.forEach(industry => incrementCount(counts.industries, industry));
    profile.languages?.forEach(language => incrementCount(counts.languages, language));
    incrementCount(counts.availability, profile.availability);
    incrementCount(counts.experienceLevels, profile.experienceLevel);
    incrementCount(counts.education, profile.education);
    profile.tags?.forEach(tag => incrementCount(counts.tags, tag));
  });

  return counts;
}

function combineCounts(totalMap, filteredMap, maxItems = 20) {
  return Array.from(totalMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxItems)
    .map(([value, total]) => ({
      value,
      total,
      matched: filteredMap.get(value) ?? 0,
    }))
    .filter(item => item.total > 0);
}

function buildFacets(allProfiles, filteredProfiles) {
  const allCounts = collectFacetCounts(allProfiles);
  const filteredCounts = collectFacetCounts(filteredProfiles);

  return {
    skills: combineCounts(allCounts.skills, filteredCounts.skills, 20),
    locations: combineCounts(allCounts.locations, filteredCounts.locations, 15),
    industries: combineCounts(allCounts.industries, filteredCounts.industries, 12),
    languages: combineCounts(allCounts.languages, filteredCounts.languages, 12),
    availability: combineCounts(allCounts.availability, filteredCounts.availability, 6),
    experienceLevels: combineCounts(allCounts.experienceLevels, filteredCounts.experienceLevels, 6),
    education: combineCounts(allCounts.education, filteredCounts.education, 6),
    tags: combineCounts(allCounts.tags, filteredCounts.tags, 12),
  };
}

function sortProfiles(profiles, sort, relevanceScores = new Map()) {
  const list = [...profiles];
  switch (sort) {
    case 'experience_desc':
      return list.sort((a, b) => b.experienceYears - a.experienceYears);
    case 'experience_asc':
      return list.sort((a, b) => a.experienceYears - b.experienceYears);
    case 'last_active':
      return list.sort(
        (a, b) => (a.lastActiveDaysAgo ?? Infinity) - (b.lastActiveDaysAgo ?? Infinity)
      );
    case 'rating':
      return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    default:
      if (relevanceScores.size) {
        return list.sort((a, b) => {
          const scoreA = relevanceScores.get(a.id) ?? 0;
          const scoreB = relevanceScores.get(b.id) ?? 0;
          if (scoreB !== scoreA) return scoreB - scoreA;
          return (a.lastActiveDaysAgo ?? Infinity) - (b.lastActiveDaysAgo ?? Infinity);
        });
      }
      return list.sort(
        (a, b) => (a.lastActiveDaysAgo ?? Infinity) - (b.lastActiveDaysAgo ?? Infinity)
      );
  }
}

export function loadTalentProfiles() {
  return cached('talentProfiles', async () => {
    const rows = await loadCsv('google_sheets_talent.csv');
    return rows
      .filter(row => {
        const name = row.full_name || row.FullName || row['Full Name'] || row.Name || row.name;
        return Boolean(name);
      })
      .map((row, index) => {
        const primaryName =
          row.full_name || row.FullName || row['Full Name'] || row.Name || row.name || '';
        const designation =
          row.designation || row.Title || row['Current Title'] || row.Role || row.role || '';
        const company = row.company || row.Company || row['Company Name'] || row.company_name || '';
        const location =
          row.location || row.Location || row.Loc || row.City || row['City/State'] || '';
        const skills = row.skills || row.Skills || row.skillset || row['Top Skills'] || '';
        const industry = row.industry || row.Industry || row.Domain || '';
        const email = row.email || row.Email || row.contact || row['Contact Email'] || '';
        const link = row.linkedin || row.LinkedIn || row.Link || row.URL || row.Url || '';

        const baseProfile = {
          fullName: primaryName,
          designation,
          company,
          location,
          skills,
          industry,
          email,
          link,
        };

        return enrichTalentProfile(baseProfile, index);
      });
  });
}

export async function loadTalentProfilesSlice({
  page = 1,
  limit = 36,
  query,
  filters = {},
  sort = 'relevance',
  includeFacets = false,
} = {}) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 100) : 36;
  const allProfiles = await loadTalentProfiles();

  let working = allProfiles;
  const relevanceScores = new Map();

  if (query && query.trim()) {
    const trimmedQuery = query.trim().toLowerCase();
    working = working
      .map(profile => {
        const score = computeRelevanceScore(profile, trimmedQuery);
        return { profile, score };
      })
      .filter(item => item.score > 0)
      .map(item => {
        relevanceScores.set(item.profile.id, item.score);
        return item.profile;
      });
  }

  working = working.filter(profile => matchesFilters(profile, filters));
  const sorted = sortProfiles(working, sort, relevanceScores);

  const total = sorted.length;
  const start = (safePage - 1) * safeLimit;
  const end = start + safeLimit;
  const profiles = sorted.slice(start, end);

  const response = {
    profiles,
    total,
    page: safePage,
    limit: safeLimit,
    hasMore: end < total,
    query: query ?? '',
    filters,
    sort,
  };

  if (includeFacets) {
    response.facets = buildFacets(allProfiles, sorted);
  }

  return response;
}

export function loadPitchDecks() {
  return cached('pitchDecks', async () => {
    try {
      const decksFromUploads = await loadPitchDecksFromUploads();
      if (decksFromUploads.length) {
        return decksFromUploads;
      }
    } catch (error) {
      console.warn('Failed to load pitch decks from uploads directory:', error);
    }
    return loadDataset('pitch_decks');
  });
}

export function loadChallenges() {
  return cached('challenges', () => loadJson('challenges.json'));
}

export function loadLiveUpdates() {
  return cached('liveUpdates', () => loadJson('live_updates.json'));
}

export function loadSuggestionRules() {
  return cached('suggestionRules', () => loadJson('suggestion_rules.json'));
}

function sanitizeStageLabel(label) {
  const cleaned = label.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned
    .split(' ')
    .map(word => {
      if (!word.length) return word;
      return word[0].toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function loadPitchDecksFromUploads() {
  let dirEntries;
  try {
    dirEntries = await fs.readdir(PUBLIC_PITCH_DECK_ROOT, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  const stageOrder = ['pre_seed', 'seed', 'series_a', 'series_b', 'y_combinator-backed_startups'];

  const decks = [];

  for (const entry of dirEntries) {
    if (!entry.isDirectory()) continue;
    const dirName = entry.name;
    const stageLabel = sanitizeStageLabel(dirName);
    const stageSlug = slugify(stageLabel);
    const stagePriority = stageOrder.indexOf(stageSlug);

    const files = await fs.readdir(path.join(PUBLIC_PITCH_DECK_ROOT, dirName));
    for (const file of files) {
      if (!file.toLowerCase().endsWith('.pdf')) continue;
      const parsed = path.parse(file);
      const baseName = parsed.name;
      const title =
        baseName.replace(/[-_]/g, ' ').trim().length > 0
          ? baseName.replace(/[-_]/g, ' ').trim()
          : `${stageLabel} Deck ${baseName}`;
      const encodedDir = encodeURIComponent(dirName);
      const encodedFile = encodeURIComponent(file);
      decks.push({
        id: `${stageSlug}-${baseName}`,
        title,
        stage: stageLabel,
        stageSlug,
        stagePriority: stagePriority === -1 ? Number.MAX_SAFE_INTEGER : stagePriority,
        fileName: file,
        fileUrl: `/uploads/PDF/${encodedDir}/${encodedFile}`,
        sourceFolder: dirName,
      });
    }
  }

  decks.sort((a, b) => {
    if (a.stagePriority === b.stagePriority) {
      return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
    }
    return a.stagePriority - b.stagePriority;
  });

  return decks;
}
