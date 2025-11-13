/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function run() {
  const startId = parseInt(process.env.START_ID || '1', 10);
  const endId = parseInt(process.env.END_ID || '50', 10);
  try {
    const deleted = await prisma.bankScheme.deleteMany({
      where: {
        id: { gte: startId, lte: endId },
      },
    });
    console.log(`Deleted bank schemes in id range ${startId}-${endId}:`, deleted.count);
  } catch (e) {
    console.error('Failed to delete bank schemes:', e.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();
