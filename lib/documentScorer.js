import { REQUIRED_DOCUMENTS } from './readinessUtils';

export function calculateDocumentScore(documents, readinessType) {
  const requiredDocs = REQUIRED_DOCUMENTS[readinessType] || REQUIRED_DOCUMENTS.FUNDING;
  const existingDocTypes = new Set(documents.map(d => d.documentType));
  const expiryDates = new Map();
  
  for (const doc of documents) {
    if (doc.expiryDate) {
      expiryDates.set(doc.documentType, new Date(doc.expiryDate));
    }
  }
  
  let totalWeight = 0;
  let earnedWeight = 0;
  let missingDocs = [];
  let expiringDocs = [];
  
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  for (const req of requiredDocs) {
    totalWeight += req.weight;
    
    const hasDocument = existingDocTypes.has(req.type);
    const expiryDate = expiryDates.get(req.type);
    const isExpired = expiryDate && expiryDate < today;
    const isExpiringSoon = expiryDate && expiryDate <= thirtyDaysFromNow && expiryDate >= today;
    
    if (hasDocument) {
      if (!isExpired) {
        earnedWeight += req.weight;
      } else {
        earnedWeight += req.weight * 0.2; // 80% penalty for expired docs
        missingDocs.push({ type: req.type, reason: 'Expired', urgency: 'HIGH' });
      }
      
      if (isExpiringSoon) {
        expiringDocs.push({
          type: req.type,
          expiryDate: expiryDate.toISOString(),
          daysRemaining: Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)),
          urgency: 'MEDIUM'
        });
      }
    } else if (req.required) {
      missingDocs.push({ type: req.type, reason: 'Missing', urgency: 'HIGH' });
    } else {
      missingDocs.push({ type: req.type, reason: 'Optional', urgency: 'LOW' });
    }
  }
  
  const score = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;
  
  return {
    score: Math.round(score),
    uploadedCount: existingDocTypes.size,
    totalRequiredCount: requiredDocs.length,
    missingDocuments: missingDocs,
    expiringDocuments: expiringDocs,
    status: score >= 80 ? 'EXCELLENT' : score >= 60 ? 'GOOD' : score >= 40 ? 'FAIR' : 'POOR'
  };
}