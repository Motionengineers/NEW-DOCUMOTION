import prisma from '@/lib/prisma';

export async function generateTrainingLabels(startDate, endDate) {
  const matches = await prisma.$queryRaw`
    SELECT 
      t.properties->>'query' as query,
      t.properties->>'matchId' as "matchId",
      t."eventType" as action,
      f.type as feedback,
      f.score as rating
    FROM "TelemetryEvent" t
    LEFT JOIN "FeedbackEvent" f ON f."targetId" = t.properties->>'matchId'
    WHERE t."eventType" IN ('MATCH_ACCEPT', 'MATCH_REJECT', 'MATCH_VIEW')
      AND t."createdAt" BETWEEN ${startDate} AND ${endDate}
  `;
  
  const labels = [];
  for (const match of matches) {
    let label = 0;
    
    if (match.action === 'MATCH_ACCEPT' || match.feedback === 'THUMBS_UP') {
      label = 1;
    } else if (match.action === 'MATCH_REJECT' || match.feedback === 'THUMBS_DOWN') {
      label = -1;
    } else if (match.rating) {
      label = (match.rating - 3) / 2;
    }
    
    labels.push({
      query: match.query,
      matchId: match.matchId,
      label,
      weight: Math.abs(label) || 0.1
    });
  }
  
  return labels;
}

export async function generateClassificationLabels() {
  const corrections = await prisma.feedbackEvent.findMany({
    where: { targetType: 'DOCUMENT_CLASSIFICATION', type: 'CORRECTION' }
  });
  
  return corrections.map(c => ({
    documentId: c.targetId,
    originalType: JSON.parse(c.comment || '{}').original,
    correctedType: JSON.parse(c.comment || '{}').corrected,
    userId: c.userId
  }));
}