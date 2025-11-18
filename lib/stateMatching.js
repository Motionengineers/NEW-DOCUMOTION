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
  seed: 0.85,
  'pre-series-a': 0.95,
  growth: 1,
};

function normalize(value) {
  return value?.toString().toLowerCase() ?? '';
}

function sectorMatchWeight(schemeSector = '', industry = '') {
  if (!schemeSector || !industry) return 0;
  const normalizedSector = normalize(schemeSector);
  const normalizedIndustry = normalize(industry);

  if (normalizedSector.includes(normalizedIndustry) || normalizedIndustry.includes(normalizedSector)) {
    return 1;
  }

  return Object.values(SECTOR_KEYWORDS).some(keywords =>
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

function normalizeNumber(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value) : null;
  const parsed = Number.parseInt(String(value).replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function computeStateMatches(profile, states, schemes) {
  const required = profile.requiredFunding ? normalizeNumber(profile.requiredFunding) : null;

  const schemesByState = {};
  for (const scheme of schemes) {
    schemesByState[scheme.stateId] = schemesByState[scheme.stateId] || [];
    schemesByState[scheme.stateId].push(scheme);
  }

  return states
    .map(state => {
      const list = schemesByState[state.id] || [];
      let sectorScore = 0;
      let fundingScore = 0;
      let interestScore = 0;
      let verifiedCount = 0;
      let grantAvailable = false;

      for (const scheme of list) {
        sectorScore = Math.max(
          sectorScore,
          sectorMatchWeight(scheme.sector || scheme.subSector || '', profile.industry || '')
        );
        fundingScore = Math.max(
          fundingScore,
          fundingFitScore(
            required,
            normalizeNumber(scheme.fundingMin),
            normalizeNumber(scheme.fundingMax)
          )
        );
        interestScore = Math.max(interestScore, interestAdvantageScore(scheme, profile.prefersGrant));
        if (scheme.verified) verifiedCount += 1;
        if (scheme.fundingType?.toLowerCase().includes('grant')) grantAvailable = true;
      }

      const weights = {
        sector: 0.4,
        funding: 0.2,
        interest: 0.15,
        verified: 0.1,
        registration: 0.1,
        popularity: 0.05,
      };

      let score = 0;
      score += sectorScore * 100 * weights.sector;
      score += fundingScore * 100 * weights.funding;
      score += interestScore * 100 * weights.interest;
      score += Math.min(1, verifiedCount / 5) * 100 * weights.verified;
      if (profile.registeredState && state.name) {
        score +=
          profile.registeredState.toLowerCase() === state.name.toLowerCase()
            ? 100 * weights.registration
            : 0;
      }
      const popularityAverage =
        list
          .slice()
          .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
          .slice(0, 3)
          .reduce((acc, entry) => acc + (entry.popularityScore || 0), 0) / Math.max(1, Math.min(3, list.length));
      score += Math.min(1, (popularityAverage || 0) / 100) * 100 * weights.popularity;

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
          note: required ? `Requested ₹${required.toLocaleString()}` : 'No funding target provided',
        },
        {
          key: 'interest',
          value: Math.round((interestScore || 0) * 100),
          weight: weights.interest,
          note: grantAvailable ? 'Grants available' : 'Interest/subsidy assessed',
        },
        {
          key: 'verified',
          value: verifiedCount,
          weight: weights.verified,
          note: `${verifiedCount} verified schemes`,
        },
      ];

      if (profile.registeredState) {
        explanation.push({
          key: 'registration',
          value: profile.registeredState.toLowerCase() === state.name?.toLowerCase() ? 100 : 0,
          weight: weights.registration,
          note:
            profile.registeredState.toLowerCase() === state.name?.toLowerCase()
              ? 'Registered here'
              : 'Not registered here',
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
          .slice(0, 3),
      };
    })
    .sort((a, b) => b.score - a.score);
}

export default computeStateMatches;

