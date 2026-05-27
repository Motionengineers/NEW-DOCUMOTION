import { autoSubmitQueue } from './index';
import prisma from '@/lib/prisma';

/**
 * Adds a submission job to the queue and creates an initial log entry.
 */
export async function enqueueSubmission(startupId, schemeId, metadata = {}) {
  // Create initial log entry in DB
  const log = await prisma.autoApplyLog.create({
    data: {
      startupId,
      schemeId,
      status: 'PENDING',
      metadata: JSON.stringify(metadata),
    },
  });

  // Add to BullMQ
  await autoSubmitQueue.add('submit_application', {
    logId: log.id,
    startupId,
    schemeId,
  });

  return log;
}