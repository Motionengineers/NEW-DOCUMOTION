export function calculateRiskScore(startup, documents) {
  let riskDeductions = 0;
  const risks = [];
  const today = new Date();
  
  // 1. Expired documents (HIGH risk)
  const expiredDocs = documents.filter(doc => {
    if (!doc.expiryDate) return false;
    return new Date(doc.expiryDate) < today;
  });
  
  if (expiredDocs.length > 0) {
    const deduction = Math.min(30, expiredDocs.length * 10);
    riskDeductions += deduction;
    risks.push({
      type: 'EXPIRED_DOCUMENTS',
      severity: 'HIGH',
      deduction,
      message: `${expiredDocs.length} critical document(s) have expired.`
    });
  }
  
  // 2. Missing critical documents (HIGH risk)
  const criticalDocs = ['GST_CERTIFICATE', 'PAN_CARD', 'INCORPORATION'];
  const existingTypes = new Set(documents.map(d => d.documentType));
  const missingCritical = criticalDocs.filter(doc => !existingTypes.has(doc));
  
  if (missingCritical.length > 0) {
    const deduction = Math.min(25, missingCritical.length * 8);
    riskDeductions += deduction;
    risks.push({
      type: 'MISSING_CRITICAL_DOCUMENTS',
      severity: 'HIGH',
      deduction,
      message: `Missing: ${missingCritical.join(', ')}`
    });
  }
  
  // 3. Incomplete profile (MEDIUM risk)
  const profileFields = ['sector', 'stage', 'location', 'askAmount'];
  const missingProfile = profileFields.filter(field => !startup[field]);
  
  if (missingProfile.length > 0) {
    const deduction = Math.min(15, missingProfile.length * 5);
    riskDeductions += deduction;
    risks.push({
      type: 'INCOMPLETE_PROFILE',
      severity: 'MEDIUM',
      deduction,
      message: `Core profile information is missing.`
    });
  }
  
  const finalScore = Math.max(0, 100 - riskDeductions);
  return {
    score: finalScore,
    risks,
    status: finalScore >= 80 ? 'LOW_RISK' : finalScore >= 60 ? 'MEDIUM_RISK' : 'HIGH_RISK'
  };
}