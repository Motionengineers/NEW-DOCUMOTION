import prisma from '@/lib/prisma';

export async function collectFeedback(userId, targetType, targetId, feedback) {
  return prisma.feedbackEvent.create({
    data: {
      type: feedback.type,
      targetType,
      targetId,
      userId,
      score: feedback.score,
      comment: feedback.comment,
      createdAt: new Date()
    }
  });
}

export async function getFeedbackForTarget(targetType, targetId) {
  const feedback = await prisma.feedbackEvent.findMany({
    where: { targetType, targetId },
    orderBy: { createdAt: 'desc' }
  });
  
  const stats = {
    total: feedback.length,
    thumbsUp: feedback.filter(f => f.type === 'THUMBS_UP').length,
    thumbsDown: feedback.filter(f => f.type === 'THUMBS_DOWN').length,
    avgScore: feedback.reduce((sum, f) => sum + (f.score || 0), 0) / feedback.length || 0
  };
  
  return { feedback, stats };
}

export async function getLowConfidencePredictions(modelName, threshold = 0.6, limit = 100) {
  return prisma.$queryRaw`
    SELECT 
      f."targetId",
      f.comment,
      f.type,
      p.properties->>'confidence' as confidence
    FROM "FeedbackEvent" f
    JOIN "TelemetryEvent" p ON p.properties->>'matchId' = f."targetId"
    WHERE f.type IN ('THUMBS_DOWN', 'CORRECTION')
      AND CAST(p.properties->>'confidence' AS FLOAT) < ${threshold}
    LIMIT ${limit}
  `;
}