const SECTOR_KEYWORDS = {
  ev: ['ev', 'electric vehicle', 'mobility', 'battery'],
  ai: ['ai', 'artificial intelligence', 'deep tech', 'ml', 'machine learning'],
  fintech: ['fintech', 'insurtech', 'regtech', 'finance'],
  climate: ['climate', 'cleantech', 'energy', 'solar', 'sustainability'],
  agritech: ['agri', 'agritech', 'food', 'farming'],
  saas: ['saas', 'software', 'product'],
  manufacturing: ['manufacturing', 'hardware', 'electronics'],
};

const STAGE_WEIGHTS = {
  idea: 0.6,
  prototype: 0.75,
  'pre-seed': 0.8,
  seed: 0.85,
  'pre-series-a': 0.95,
  early: 0.9,
  growth: 1,
};

const DEFAULT_WEIGHTS = {
  sector: 0.35,
  funding: 0.25,
  interest: 0.15,
  verified: 0.08,
  registration: 0.07,
  stage: 0.07,
  success: 0.03,
  vector: 0.0,
};

const SUCCESS_RATE_HINTS = {
  karnataka: { rate: 0.62 },
  maharashtra: { rate: 0.58 },
  telangana: { rate: 0.55 },
  gujarat: { rate: 0.53 },
};

function normalize(value) {
  return value?.toString().toLowerCase() ?? '';
}

function normalizeNumber(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value) : null;
  const parsed = Number.parseInt(String(value).replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function sectorMatchWeight(schemeSector = '', industry = '') {
  if (!schemeSector || !industry) return 0;
  const normalizedSector = normalize(schemeSector);
  const normalizedIndustry = normalize(industry);

  if (normalizedSector.includes(normalizedIndustry) || normalizedIndustry.includes(normalizedSector)) {
    return 1;
  }

  return Object.values(SECTOR_KEYWORDS).some(
    keywords =>
      keywords.some(keyword => normalizedSector.includes(keyword)) &&
      keywords.some(keyword => normalizedIndustry.includes(keyword))
  )
    ? 0.8
    : 0.2;
}

function fundingFitScore(required, min, max) {
  if (!required) return 0.5;
  if (!min && !max) return 0.2;
  if (min !== null && max !== null && min <= required && required <= max) return 1;
  if (required < (min ?? 0)) return Math.max(0.2, required / Math.max(min, 1));
  if (required > (max ?? 0)) return Math.max(0.1, (max ?? 0) / required);
  return 0.3;
}

function interestAdvantageScore(scheme, prefersGrant) {
  if (!scheme) return 0;
  if (prefersGrant && scheme.fundingType?.toLowerCase() === 'grant') return 1;
  if (scheme.subsidyPercent) return Math.min(1, scheme.subsidyPercent / 50);
  if (scheme.interestRate != null) {
    const inverted = Math.max(0, 15 - scheme.interestRate);
    return Math.min(1, inverted / 15);
  }
  return 0.3;
}

function normalizeWeights(overrides = {}) {
  const merged = { ...DEFAULT_WEIGHTS, ...overrides };
  const total = Object.values(merged).reduce((sum, value) => sum + value, 0) || 1;
  return Object.fromEntries(Object.entries(merged).map(([key, value]) => [key, value / total]));
}

function cosineSimilarity(vectorA = [], vectorB = []) {
  if (!vectorA.length || !vectorB.length) return 0;
  const dot = vectorA.reduce((sum, value, index) => sum + value * (vectorB[index] ?? 0), 0);
  const magA = Math.sqrt(vectorA.reduce((sum, value) => sum + value * value, 0));
  const magB = Math.sqrt(vectorB.reduce((sum, value) => sum + value * value, 0));
  if (!magA || !magB) return 0;
  return dot / (magA * magB);
}

function buildVector(scores = {}) {
  return [
    scores.sectorScore ?? 0,
    scores.fundingScore ?? 0,
    scores.interestScore ?? 0,
    scores.stageScore ?? 0,
  ];
}

function filterSchemesForProfile(profile, schemes = []) {
  if (!profile.industry && !profile.stage && !profile.requiredFunding) {
    return schemes;
  }
  const normalizedIndustry = normalize(profile.industry);
  const required = normalizeNumber(profile.requiredFunding);
  const stage = normalize(profile.stage);

  return schemes.filter(scheme => {
    const sectorMatch =
      !normalizedIndustry ||
      sectorMatchWeight(scheme.sector || scheme.subSector || '', normalizedIndustry) >= 0.4;

    const stageMatch =
      !stage || !scheme.tags
        ? true
        : scheme.tags.toLowerCase().includes(stage);

    if (!sectorMatch || !stageMatch) return false;

    if (!required) return true;
    const min = normalizeNumber(scheme.fundingMin);
    const max = normalizeNumber(scheme.fundingMax);
    if (min && required < min * 0.4) return false;
    if (max && required > max * 1.6) return false;
    return true;
  });
}

export function computeStateMatches(profile, states, schemes, options = {}) {
  const normalizedProfile = {
    ...profile,
    industry: normalize(profile.industry || ''),
    stage: normalize(profile.stage || ''),
    registeredState: profile.registeredState ?? '',
    requiredFunding: profile.requiredFunding ? normalizeNumber(profile.requiredFunding) : null,
  };

  const weights = normalizeWeights(options.weights);
  const historySuccess = options.historyStats || SUCCESS_RATE_HINTS;
  const candidateSchemes = options.prefilter === false ? schemes : filterSchemesForProfile(profile, schemes);

  const schemesByState = {};
  for (const scheme of candidateSchemes) {
    schemesByState[scheme.stateId] = schemesByState[scheme.stateId] || [];
    schemesByState[scheme.stateId].push(scheme);
  }

  const results = states
    .map(state => {
      const list = schemesByState[state.id] || [];
      if (!list.length) {
        return {
          stateId: state.id,
          stateName: state.name,
          state,
          score: 0,
          explanation: [],
          topSchemes: [],
        };
      }

      let sectorScore = 0;
      let fundingScore = 0;
      let interestScore = 0;
      let verifiedCount = 0;
      let grantAvailable = false;

      for (const scheme of list) {
        sectorScore = Math.max(
          sectorScore,
          sectorMatchWeight(scheme.sector || scheme.subSector || '', normalizedProfile.industry || '')
        );
        fundingScore = Math.max(
          fundingScore,
          fundingFitScore(
            normalizedProfile.requiredFunding,
            normalizeNumber(scheme.fundingMin),
            normalizeNumber(scheme.fundingMax)
          )
        );
        interestScore = Math.max(
          interestScore,
          interestAdvantageScore(scheme, normalizedProfile.prefersGrant)
        );
        if (scheme.verified) verifiedCount += 1;
        if (scheme.fundingType?.toLowerCase().includes('grant')) grantAvailable = true;
      }

      const stageScore = STAGE_WEIGHTS[normalizedProfile.stage] ?? 0.75;

      const similarityVectorScore = cosineSimilarity(
        buildVector({ sectorScore, fundingScore, interestScore, stageScore }),
        [1, 1, 1, 1]
      );

      const successEntry =
        historySuccess[state.id] ||
        historySuccess[state.name?.toLowerCase() || ''] ||
        {};
      const successScore =
        typeof successEntry.successRate === 'number'
          ? successEntry.successRate
          : successEntry.rate ?? 0;

      let score = 0;
      score += sectorScore * 100 * (weights.sector ?? 0);
      score += fundingScore * 100 * (weights.funding ?? 0);
      score += interestScore * 100 * (weights.interest ?? 0);
      score += Math.min(1, verifiedCount / 5) * 100 * (weights.verified ?? 0);
      score += stageScore * 100 * (weights.stage ?? 0);
      score += similarityVectorScore * 100 * (weights.vector ?? 0);
      score += successScore * 100 * (weights.success ?? 0);
      if (normalizedProfile.registeredState && state.name) {
        const matchesRegistration =
          normalizedProfile.registeredState.toLowerCase() === state.name.toLowerCase();
        score += (matchesRegistration ? 1 : 0) * 100 * (weights.registration ?? 0);
      }

      const explanation = [
        {
          key: 'sector',
          value: Math.round((sectorScore || 0) * 100),
          weight: weights.sector,
          note: sectorScore ? 'Sector match found' : 'No close sector match',
        },
        {
          key: 'funding',
          value: Math.round((fundingScore || 0) * 100),
          weight: weights.funding,
          note: normalizedProfile.requiredFunding
            ? `Target ₹${normalizedProfile.requiredFunding.toLocaleString()}`
            : 'No funding target provided',
        },
        {
          key: 'interest',
          value: Math.round((interestScore || 0) * 100),
          weight: weights.interest,
          note: grantAvailable ? 'Grants/subsidies listed' : 'Interest terms evaluated',
        },
        {
          key: 'verified',
          value: verifiedCount,
          weight: weights.verified,
          note: `${verifiedCount} verified programmes`,
        },
        {
          key: 'stage',
          value: Math.round((stageScore || 0) * 100),
          weight: weights.stage,
          note: `Stage preference (${profile.stage || normalizedProfile.stage || 'seed'})`,
        },
      ];

      if (weights.vector) {
        explanation.push({
          key: 'similarity',
          value: Math.round((similarityVectorScore || 0) * 100),
          weight: weights.vector,
          note: 'Overall profile similarity',
        });
      }

      if (weights.success && successScore) {
        explanation.push({
          key: 'success',
          value: Math.round((successScore || 0) * 100),
          weight: weights.success,
          note: `Historical success ${(successScore * 100).toFixed(0)}%`,
        });
      }

      if (normalizedProfile.registeredState) {
        explanation.push({
          key: 'registration',
          value:
            normalizedProfile.registeredState.toLowerCase() === state.name?.toLowerCase() ? 100 : 0,
          weight: weights.registration,
          note:
            normalizedProfile.registeredState.toLowerCase() === state.name?.toLowerCase()
              ? 'Startup registered here'
              : 'Different registered state',
        });
      }

      return {
        stateId: state.id,
        stateName: state.name,
        state,
        score: Math.round(Math.min(100, score)),
        explanation,
        topSchemes: list
          .slice()
          .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
          .slice(0, options.schemePreviewLimit ?? 3),
      };
    })
    .sort((a, b) => b.score - a.score);

  return typeof options.limit === 'number' ? results.slice(0, options.limit) : results;
}

export default computeStateMatches;

