import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

/**
 * Prisma Client with connection pooling for production
 *
 * In production, use connection pooling URL:
 * postgresql://user:pass@host:5432/db?pgbouncer=true
 */
const databaseUrl =
  process.env.DATABASE_POOL_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/documotion';

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
