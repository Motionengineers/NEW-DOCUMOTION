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

export function loadTalentProfiles() {
  return cached('talentProfiles', async () => {
    const rows = await loadCsv('google_sheets_talent.csv');
    return rows
      .filter(row => {
        const name =
          row.full_name ||
          row.FullName ||
          row['Full Name'] ||
          row.Name ||
          row.name;
        return Boolean(name);
      })
      .map(row => {
        const primaryName =
          row.full_name ||
          row.FullName ||
          row['Full Name'] ||
          row.Name ||
          row.name ||
          '';
        const designation =
          row.designation ||
          row.Title ||
          row['Current Title'] ||
          row.Role ||
          row.role ||
          '';
        const company =
          row.company ||
          row.Company ||
          row['Company Name'] ||
          row.company_name ||
          '';
        const location =
          row.location ||
          row.Location ||
          row.Loc ||
          row.City ||
          row['City/State'] ||
          '';
        const skills =
          row.skills ||
          row.Skills ||
          row.skillset ||
          row['Top Skills'] ||
          '';
        const industry =
          row.industry ||
          row.Industry ||
          row.Domain ||
          '';
        const email =
          row.email ||
          row.Email ||
          row.contact ||
          row['Contact Email'] ||
          '';
        const link =
          row.linkedin ||
          row.LinkedIn ||
          row.Link ||
          row.URL ||
          row.Url ||
          '';

        return {
          fullName: primaryName,
          designation,
          company,
          location,
          skills,
          industry,
          email,
          link,
        };
      });
  });
}

export async function loadTalentProfilesSlice({ page = 1, limit = 36, query } = {}) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 100) : 36;
  const allProfiles = await loadTalentProfiles();

  let filtered = allProfiles;
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = allProfiles.filter(profile => {
      return [
        profile.fullName,
        profile.designation,
        profile.company,
        profile.location,
        profile.industry,
        profile.skills,
      ]
        .filter(Boolean)
        .some(value => value.toLowerCase().includes(q));
    });
  }

  const total = filtered.length;
  const start = (safePage - 1) * safeLimit;
  const end = start + safeLimit;
  const profiles = filtered.slice(start, end);

  return {
    profiles,
    total,
    page: safePage,
    limit: safeLimit,
    hasMore: end < total,
  };
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
  const cleaned = label
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

  const stageOrder = [
    'pre_seed',
    'seed',
    'series_a',
    'series_b',
    'y_combinator-backed_startups',
  ];

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

