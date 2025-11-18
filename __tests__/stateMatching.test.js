import assert from 'assert';
import computeStateMatches from '../lib/stateMatching.js';

const states = [
  { id: 1, name: 'Karnataka', abbreviation: 'KA' },
  { id: 2, name: 'Maharashtra', abbreviation: 'MH' },
];

const schemes = [
  {
    id: 101,
    stateId: 1,
    sector: 'AI',
    fundingType: 'Grant',
    fundingMin: 1000000,
    fundingMax: 5000000,
    verified: true,
    popularityScore: 40,
  },
  {
    id: 201,
    stateId: 2,
    sector: 'EV',
    fundingType: 'Loan',
    subsidyPercent: 10,
    fundingMin: 5000000,
    fundingMax: 20000000,
    verified: false,
    popularityScore: 10,
  },
];

describe('computeStateMatches', () => {
  it('ranks states based on sector and funding fit', () => {
    const profile = {
      industry: 'AI',
      stage: 'seed',
      requiredFunding: 2000000,
      registeredState: 'Karnataka',
      prefersGrant: true,
    };

    const [first, second] = computeStateMatches(profile, states, schemes);
    assert.strictEqual(first.stateName, 'Karnataka');
    assert.ok(first.score >= second.score);
  });
});

