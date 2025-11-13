import { loadBankPrograms } from './dataSources.js';

const STAGE_NORMALISATION = {
  idea: 'idea',
  'pre-seed': 'pre-seed',
  preseed: 'pre-seed',
  'pre seed': 'pre-seed',
  discovery: 'pre-seed',
  prototype: 'pre-seed',
  mvp: 'pre-seed',
  seed: 'seed',
  'series a': 'series a',
  seriesa: 'series a',
  growth: 'growth',
  scale: 'growth',
};

const STATE_ALIASES = new Map([
  ['national', 'national'],
  ['pan-india', 'national'],
  ['all india', 'national'],
]);

const DEFAULT_PROFILE = {
  stage: null,
  sectors: [],
  revenue: null,
  revenueBand: null,
  state: null,
  services: [],
  specialCriteria: [],
  bankTypes: [],
  loanPreference: { min: null, max: null },
};

function normalise(value) {
  return (value || '').toString().trim().toLowerCase();
}

function normaliseStage(value) {
  if (!value) return null;
  const key = normalise(value);
  return STAGE_NORMALISATION[key] || key;
}

function splitToArray(input) {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map(item => normalise(item)).filter(Boolean);
  }
  return String(input)
    .split(/[,;|]/)
    .map(item => normalise(item))
    .filter(Boolean);
}

function deriveRevenueBand(value, band) {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    if (value < 1) return { min: 0, max: 1, label: '<1cr' };
    if (value < 5) return { min: 1, max: 5, label: '1-5cr' };
    if (value < 10) return { min: 5, max: 10, label: '5-10cr' };
    return { min: 10, max: null, label: '10cr+' };
  }
  const key = normalise(band);
  switch (key) {
    case '<1cr':
    case 'below-1cr':
    case 'under-1cr':
      return { min: 0, max: 1, label: '<1cr' };
    case '1-5cr':
    case '1to5cr':
    case '1-5':
      return { min: 1, max: 5, label: '1-5cr' };
    case '5-10cr':
      return { min: 5, max: 10, label: '5-10cr' };
    case '10cr+':
    case '10+cr':
    case '>10cr':
      return { min: 10, max: null, label: '10cr+' };
    default:
      return { min: null, max: null, label: null };
  }
}

function extractState(value) {
  if (!value) return null;
  const parts = value.split(',').map(item => normalise(item));
  if (!parts.length) return null;
  const guess = parts[parts.length - 1];
  return STATE_ALIASES.get(guess) || guess;
}

function parseServices(value) {
  const tokens = splitToArray(value);
  return tokens.map(token => token.replace(/\s+/g, '-'));
}

function parseSpecialCriteria(value) {
  return splitToArray(value);
}

function parseBankTypes(value) {
  const tokens = splitToArray(value);
  return tokens.filter(token => ['public', 'private', 'fintech', 'nbfc'].includes(token));
}

export function normaliseProfile(input = {}) {
  const stage = normaliseStage(input.stage ?? input.currentStage);
  const sectors = splitToArray(input.sector ?? input.industries ?? input.sectors);
  const revenue = typeof input.revenue === 'number' ? input.revenue : null;
  const revenueBand = deriveRevenueBand(revenue, input.revenueBand);
  const services = parseServices(input.servicesNeeded ?? input.services ?? input.requiredServices);
  const specialCriteria = parseSpecialCriteria(input.specialCriteria ?? input.criteria);
  const bankTypes = parseBankTypes(input.preferredBankTypes ?? input.bankTypes);

  const profile = {
    ...DEFAULT_PROFILE,
    stage,
    sectors,
    revenue,
    revenueBand,
    state: extractState(input.state ?? input.location ?? input.registeredState),
    services,
    specialCriteria,
    bankTypes,
    loanPreference: {
      min: typeof input.preferredLoanMin === 'number' ? input.preferredLoanMin : null,
      max: typeof input.preferredLoanMax === 'number' ? input.preferredLoanMax : null,
    },
  };

  return profile;
}

function programSupportsState(programStates, state) {
  if (!programStates?.length) return true;
  const normalisedStates = programStates.map(normalise);
  if (normalisedStates.includes('national')) return true;
  if (!state) return false;
  return normalisedStates.includes(normalise(state));
}

function matchesRequiredCriteria(required, provided) {
  if (!required?.length) return true;
  if (!provided?.length) return false;
  return required.every(entry => provided.includes(normalise(entry)));
}

function calculateServiceAlignment(required, available) {
  if (!required?.length) return 0;
  if (!available?.length) return 0;
  const matched = required.filter(item => available.includes(item));
  return matched.length / required.length;
}

function calculateScore(program, profile) {
  const breakdown = [];
  let totalWeight = 0;
  let achieved = 0;

  function consider(label, matched, weight, detail) {
    if (weight <= 0) return;
    totalWeight += weight;
    if (matched) {
      achieved += weight;
    }
    breakdown.push({ label, matched, weight, detail });
  }

  const eligibility = program.eligibility || {};

  if (eligibility.stages?.length) {
    const matched = eligibility.stages.map(normaliseStage).includes(profile.stage);
    consider('Stage', matched, 20, profile.stage);
    if (!matched) {
      return { eligible: false };
    }
  }

  if (eligibility.sectors?.length) {
    const sectorMatch = profile.sectors.some(sector =>
      eligibility.sectors.map(normalise).includes(sector)
    );
    consider('Sector', sectorMatch, 12, profile.sectors.join(', '));
    if (!sectorMatch) {
      return { eligible: false };
    }
  }

  if (eligibility.minRevenue !== undefined || eligibility.maxRevenue !== undefined) {
    const { min, max } = {
      min: eligibility.minRevenue ?? null,
      max: eligibility.maxRevenue ?? null,
    };
    const revenue = profile.revenue ?? profile.revenueBand.min;
    const revenueUpper = profile.revenue ?? profile.revenueBand.max;
    const meetsMin = min === null || (revenue !== null && revenue >= min);
    const meetsMax = max === null || (revenueUpper !== null && revenueUpper <= max);
    const revenueMatched = Boolean(meetsMin && meetsMax);
    consider('Revenue', revenueMatched, 14, revenue ?? profile.revenueBand.label);
    if (!revenueMatched) {
      return { eligible: false };
    }
  }

  if (!programSupportsState(eligibility.states, profile.state)) {
    return { eligible: false };
  }
  if (eligibility.states?.length) {
    const matchedState = programSupportsState(eligibility.states, profile.state ?? 'national');
    consider('Location', matchedState, 10, profile.state || 'national');
  }

  const requiredServices = splitToArray(eligibility.services);
  if (requiredServices.length) {
    const coverage = calculateServiceAlignment(requiredServices, profile.services);
    if (coverage === 0) {
      return { eligible: false };
    }
    consider('Service alignment', coverage > 0, 18, `${Math.round(coverage * 100)}% coverage`);
    achieved += 18 * coverage - 18; // adjust to partial credit; initial consider added full weight if coverage>0
  }

  if (!matchesRequiredCriteria(eligibility.specialCriteria, profile.specialCriteria)) {
    return { eligible: false };
  }
  if (eligibility.specialCriteria?.length) {
    consider('Special criteria', true, 10, eligibility.specialCriteria.join(', '));
  }

  if (profile.bankTypes.length && program.bankType) {
    const matched = profile.bankTypes.includes(normalise(program.bankType));
    consider('Preferred bank type', matched, 6, program.bankType);
  }

  if (
    (profile.loanPreference.min ?? null) !== null ||
    (profile.loanPreference.max ?? null) !== null
  ) {
    const minPref = profile.loanPreference.min ?? 0;
    const maxPref = profile.loanPreference.max ?? null;
    const minLoan = program.minLoanAmount ?? 0;
    const maxLoan = program.maxLoanAmount ?? null;
    const lowerOk = maxPref === null || (maxLoan !== null && maxLoan >= minPref);
    const upperOk = minPref === 0 || (minLoan !== null && minLoan <= (maxPref ?? minLoan));
    const loanMatched = lowerOk && upperOk;
    consider('Loan range', loanMatched, 8, `${minLoan ?? 0}-${maxLoan ?? 'N/A'}`);
  }

  const score =
    totalWeight > 0 ? Math.round(Math.max(0, Math.min(100, (achieved / totalWeight) * 100))) : 60;
  return { eligible: true, score, breakdown };
}

export async function matchBankPrograms(profileInput = {}, { limit = 12, filters = {} } = {}) {
  const profile = normaliseProfile(profileInput);
  const programs = await loadBankPrograms();

  const normalisedFilters = {
    programType: filters.programType ? splitToArray(filters.programType) : [],
    bankType: filters.bankType ? splitToArray(filters.bankType) : [],
  };

  const matched = programs
    .map(program => {
      if (
        normalisedFilters.programType.length &&
        !program.programType?.some(type => normalisedFilters.programType.includes(normalise(type)))
      ) {
        return null;
      }
      if (
        normalisedFilters.bankType.length &&
        !normalisedFilters.bankType.includes(normalise(program.bankType))
      ) {
        return null;
      }

      const result = calculateScore(program, profile);
      if (!result.eligible) {
        return null;
      }

      return {
        id: program.id,
        bankName: program.bankName,
        bankSlug: program.bankSlug,
        programName: program.programName,
        programType: program.programType || [],
        bankType: program.bankType,
        services: program.services || [],
        minLoanAmount: program.minLoanAmount ?? null,
        maxLoanAmount: program.maxLoanAmount ?? null,
        interestRate: program.interestRate || null,
        tenure: program.tenure || null,
        processingFees: program.processingFees || null,
        eligibility: program.eligibility || {},
        benefits: program.benefits || [],
        documents: program.documents || [],
        contact: program.contact || {},
        applyUrl: program.applyUrl || program.officialSource || null,
        score: result.score,
        breakdown: result.breakdown,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  const recommendations = limit ? matched.slice(0, limit) : matched;
  const topPicks = recommendations.slice(0, 3);

  return {
    profile,
    total: matched.length,
    matches: recommendations,
    topPicks,
  };
}

export function normaliseStartupProfileForMatching(startup = {}) {
  return {
    stage: startup.stage || null,
    sector: startup.sector || null,
    sectors: splitToArray(startup.sectors || startup.sector),
    revenue: typeof startup.revenue === 'number' ? startup.revenue : null,
    revenueBand: startup.revenueBand || null,
    location: startup.location || null,
    servicesNeeded: startup.servicesNeeded || null,
    specialCriteria: startup.specialCriteria || null,
    preferredBankTypes: startup.preferredBankTypes || null,
    preferredLoanMin: startup.preferredLoanMin ?? null,
    preferredLoanMax: startup.preferredLoanMax ?? null,
  };
}
