import prisma from '@/lib/prisma';

export async function trackClick(userId, startupId, sessionId, clickData) {
  return prisma.telemetryEvent.create({
    data: {
      eventType: 'CLICK',
      userId,
      startupId,
      sessionId,
      properties: {
        target: clickData.target,
        elementId: clickData.elementId,
        url: clickData.url,
        timestamp: new Date().toISOString(),
        ...clickData.metadata
      }
    }
  });
}

export async function trackSearch(userId, startupId, sessionId, query, resultsCount) {
  return prisma.telemetryEvent.create({
    data: {
      eventType: 'SEARCH',
      userId,
      startupId,
      sessionId,
      properties: {
        query,
        resultsCount,
        timestamp: new Date().toISOString()
      }
    }
  });
}

export async function trackMatchInteraction(userId, matchId, matchType, action) {
  return prisma.telemetryEvent.create({
    data: {
      eventType: `MATCH_${action}`,
      userId,
      properties: { matchId, matchType, timestamp: new Date().toISOString() }
    }
  });
}