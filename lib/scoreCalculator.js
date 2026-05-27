import { WEIGHTS } from './readinessUtils';
import { calculateDocumentScore } from './documentScorer';
import { calculateProfileScore } from './profileScorer';
import { calculateRiskScore } from './riskScorer';

/**
 * Orchestrates the overall readiness calculation for a startup.
 * Combines document, profile, and risk scores based on the specific readiness type.
 */
export function calculateOverallReadiness(startup, documents, type = 'FUNDING') {
  const weights = WEIGHTS[type] || WEIGHTS.FUNDING;

  const docResults = calculateDocumentScore(documents, type);
  const profileResults = calculateProfileScore(startup);
  const riskResults = calculateRiskScore(startup, documents);

  // Weighted average calculation
  const overallScore = Math.round(
    (docResults.score * weights.documentCompleteness) +
    (profileResults.score * weights.profileCompleteness) +
    (riskResults.score * weights.riskAssessment)
  );

  return {
    score: overallScore,
    status: overallScore >= 80 ? 'EXCELLENT' : overallScore >= 60 ? 'GOOD' : 'FAIR',
    type,
    components: {
      documents: docResults,
      profile: profileResults,
      risk: riskResults
    },
    breakdown: {
      documentWeight: weights.documentCompleteness,
      profileWeight: weights.profileCompleteness,
      riskWeight: weights.riskAssessment
    }
  };
}