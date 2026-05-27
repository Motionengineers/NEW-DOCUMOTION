import { Worker } from 'bullmq';
import prisma from '@/lib/prisma';
import IORedis from 'ioredis';
import { QUEUE_NAME } from './index';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const setupWorker = () => {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { logId, startupId, schemeId } = job.data;

      try {
        await prisma.autoApplyLog.update({
          where: { id: logId },
          data: { status: 'PROCESSING', updatedAt: new Date() },
        });

        // 1. Fetch data requirements (Startup details, Documents)
        const startup = await prisma.startup.findUnique({ where: { id: startupId }, include: { documents: true } });
        const scheme = await prisma.govtScheme.findUnique({ where: { id: schemeId } });

        if (!startup || !scheme) throw new Error('Missing startup or scheme data');

        // 2. Perform submission logic (Simulated here)
        // In production, this would call external Portal APIs
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // 3. Update log on success
        await prisma.autoApplyLog.update({
          where: { id: logId },
          data: { 
            status: 'COMPLETED', 
            result: JSON.stringify({ receiptId: `RCPT-${Math.floor(Math.random() * 100000)}` }) 
          },
        });
      } catch (error) {
        await prisma.autoApplyLog.update({
          where: { id: logId },
          data: { status: 'FAILED', error: error.message },
        });
        throw error;
      }
    },
    { connection, concurrency: parseInt(process.env.AUTO_SUBMIT_CONCURRENCY || '3') }
  );

  return worker;
};