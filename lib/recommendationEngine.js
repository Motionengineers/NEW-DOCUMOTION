import { loadGovtSchemes, loadSuggestionRules } from './dataSources.js';

const stageAliases = new Map([
  ['idea', 'idea'],
  ['prototype', 'prototype'],
  ['pre-seed', 'pre-seed'],
  ['pre seed', 'pre-seed'],
  ['preseed', 'pre-seed'],
  ['mvp', 'mvp'],
  ['seed', 'seed'],
  ['series a', 'series a'],
  ['growth', 'growth'],
  ['early', 'early'],
]);

function normalise(value) {
  return (value || '').toString().trim().toLowerCase();
}

function normaliseStage(stage) {
  const key = normalise(stage);
  return stageAliases.get(key) || key || null;
}

function extractState(location) {
  if (!location) return null;
  const parts = location.split(',').map(part => normalise(part));
  if (parts.length === 0) return null;
  return parts[parts.length - 1] || null;
}

function evaluateCondition(key, expected, profile) {
  switch (key) {
    case 'stage': {
      const stage = profile.stage;
      if (!stage) return null;
      const expectedList = Array.isArray(expected) ? expected : [expected];
      return expectedList.some(item => stage === normaliseStage(item));
    }
    case 'has_prototype': {
      if (profile.hasPrototype === undefined) return null;
      return Boolean(profile.hasPrototype) === Boolean(expected);
    }
    case 'needs_loan': {
      if (profile.needsLoan === undefined) return null;
      return Boolean(profile.needsLoan) === Boolean(expected);
    }
    case 'sector': {
      if (!profile.sectorTokens?.length) return null;
      const tokens = Array.isArray(expected) ? expected : [expected];
      return tokens.some(token => profile.sectorTokens.includes(normalise(token)));
    }
    case 'state': {
      if (!profile.state) return null;
      return profile.state === normalise(expected);
    }
    case 'age_limit':
    case 'collateral':
    case 'founder_type':
    case 'loan_amount': {
      // Not currently captured in the UI – treat as insufficient data
      return null;
    }
    default:
      return null;
  }
}

function evaluateRule(matchConfig, profile) {
  let considered = 0;
  let matched = 0;

  for (const [key, expected] of Object.entries(matchConfig)) {
    const result = evaluateCondition(key, expected, profile);
    if (result === null) {
      continue;
    }
    considered += 1;
    if (result) {
      matched += 1;
    }
  }

  if (considered === 0) {
    return { matched: 0, total: 0, score: 25 }; // default neutral score
  }

  const score = Math.round((matched / considered) * 100);
  return { matched, total: considered, score };
}

function shapeScheme(raw) {
  if (!raw) return null;
  return {
    schemeName: raw.scheme_name || raw.schemeName,
    ministry: raw.ministry_or_department || raw.ministry,
    category: raw.category || null,
    eligibility: raw.eligibility || '',
    benefits: raw.benefits || '',
    maxAssistance: raw.max_assistance || raw.maxAssistance || '',
    officialLink: raw.official_link || raw.officialLink || '',
    status: raw.status || '',
  };
}

function normaliseProfile(input = {}) {
  const stage = normaliseStage(input.stage);
  const sectorTokens = normalise(input.sector)
    .split(/[\/,&]/)
    .map(token => token.trim())
    .filter(Boolean);
  const location = input.location || '';
  return {
    stage,
    sectorTokens,
    hasPrototype: input.has_prototype ?? input.hasPrototype ?? false,
    needsLoan: input.needs_loan ?? input.needsLoan ?? false,
    state: extractState(input.state || location),
  };
}

export async function getSchemeRecommendations(context = {}) {
  const profile = normaliseProfile(context.startup || context);
  const [schemes, rules] = await Promise.all([loadGovtSchemes(), loadSuggestionRules()]);

  const results = rules
    .map(rule => {
      const scheme = schemes.find(item => normalise(item.scheme_name) === normalise(rule.scheme));
      const shapedScheme = shapeScheme(scheme);
      if (!shapedScheme) {
        return null;
      }
      const evaluation = evaluateRule(rule.match ?? {}, profile);
      return {
        scheme: shapedScheme,
        evaluation,
        message: rule.message || '',
      };
    })
    .filter(Boolean)
    .map(result => ({
      ...result,
      score: result.evaluation.score,
    }))
    .sort((a, b) => b.score - a.score);

  // Provide fallback suggestions if the list is empty
  const fallbackSchemes =
    results.length > 0
      ? results
      : schemes.slice(0, 5).map(item => ({
          scheme: shapeScheme(item),
          evaluation: { matched: 0, total: 0, score: 40 },
          message: 'Discover more details and confirm eligibility with our team.',
          score: 40,
        }));

  return {
    recommendations: fallbackSchemes,
    topMatches: fallbackSchemes.slice(0, 5),
  };
}

export async function getEligibilitySummary(context = {}) {
  const { topMatches } = await getSchemeRecommendations(context);
  const suggestions = topMatches.slice(0, 5).map(entry => ({
    scheme: entry.scheme.schemeName,
    matched: entry.evaluation.matched,
    total: entry.evaluation.total,
    score: entry.score,
    message: entry.message,
  }));

  const eligibleCount = suggestions.filter(item => item.score >= 50).length;
  return {
    eligible: eligibleCount,
    total: topMatches.length,
    suggestions,
  };
}

