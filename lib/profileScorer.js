export function calculateProfileScore(startup) {
  const fields = [
    { name: 'name', weight: 10, required: true },
    { name: 'sector', weight: 15, required: true },
    { name: 'stage', weight: 15, required: true },
    { name: 'location', weight: 10, required: true },
    { name: 'askAmount', weight: 15, required: true },
    { name: 'teamSize', weight: 10, required: false },
    { name: 'revenueCr', weight: 10, required: false },
    { name: 'foundedYear', weight: 10, required: false },
    { name: 'description', weight: 5, required: false }
  ];
  
  let totalWeight = 0;
  let earnedWeight = 0;
  let missingFields = [];
  
  for (const field of fields) {
    totalWeight += field.weight;
    const value = startup[field.name];
    const hasValue = value !== null && value !== undefined && value !== '';
    
    if (hasValue) {
      earnedWeight += field.weight;
    } else if (field.required) {
      missingFields.push(field.name);
    }
  }
  
  const score = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;
  
  return {
    score: Math.round(score),
    components: {
      completedFields: fields.filter(f => startup[f.name]).length,
      totalRequired: fields.filter(f => f.required).length,
      missingRequiredFields: missingFields
    },
    status: score >= 80 ? 'EXCELLENT' : score >= 60 ? 'GOOD' : score >= 40 ? 'FAIR' : 'POOR'
  };
}