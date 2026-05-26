import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import twilio from 'twilio';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const checks = {
    database: { status: 'unhealthy', responseTimeMs: 0 },
    twilio: { status: 'unhealthy' },
    failureRate: { exceeded: false, rate: 0 },
  };

  try {
    // 1. DB Check
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database.status = 'healthy';
    checks.database.responseTimeMs = Date.now() - dbStart;

    // 2. Twilio Connectivity (Lightweight account fetch)
    try {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const account = await client.api.v2010.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      checks.twilio = { status: 'healthy', accountName: account.friendlyName };
    } catch (e) {
      checks.twilio.error = e.message;
    }

    // 3. Failure Rate Check (Last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const stats = await prisma.whatsAppMessageMetric.groupBy({
      by: ['status'],
      where: { sendTime: { gte: tenMinutesAgo } },
      _count: { _all: true },
    });

    const total = stats.reduce((acc, curr) => acc + curr._count._all, 0);
    const failed = stats.find(s => s.status === 'failed')?._count._all || 0;

    checks.failureRate.rate = total > 0 ? (failed / total) * 100 : 0;
    checks.failureRate.exceeded = total > 10 && checks.failureRate.rate > 5;

    const isHealthy =
      checks.database.status === 'healthy' &&
      checks.twilio.status === 'healthy' &&
      !checks.failureRate.exceeded;

    const payload = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    };

    return NextResponse.json(payload, { status: isHealthy ? 200 : 503 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
