import prisma from './prisma';
import { sendTransactionalEmail } from './email';

/**
 * Evaluates system health and triggers external alerts (Slack/Email).
 * This should be called by a cron job every 5-10 minutes.
 */
export async function runMonitoringAudit() {
  const results = [];
  const now = new Date();
  const window = new Date(now.getTime() - 15 * 60 * 1000); // 15m window

  // 1. Check Failure Rate
  const metrics = await prisma.whatsAppMessageMetric.groupBy({
    by: ['status'],
    where: { sendTime: { gte: window } },
    _count: { _all: true },
  });

  const total = metrics.reduce((a, c) => a + c._count._all, 0);
  const failed = metrics.find(m => m.status === 'failed')?._count._all || 0;
  const rate = total > 0 ? (failed / total) * 100 : 0;

  if (total >= 10 && rate > 5) {
    const alert = {
      alertType: 'high_failure_rate',
      severity: rate > 15 ? 'critical' : 'warning',
      message: `WhatsApp failure rate is ${rate.toFixed(1)}% (${failed}/${total})`,
      metrics: { total, failed, rate },
    };

    await triggerAlert(alert);
    results.push(alert);
  }

  return results;
}

async function triggerAlert(data) {
  // Record in DB
  await prisma.whatsAppAlert.create({ data });

  // Send via Email (Resend)
  await sendTransactionalEmail({
    to: process.env.ADMIN_EMAIL || 'ops@documotion.in',
    subject: `[ALERT] ${data.alertType.toUpperCase()}`,
    html: `<p><strong>Severity:</strong> ${data.severity}</p><p>${data.message}</p>`,
  });

  // Log for aggregator
  console.warn(JSON.stringify({ type: 'system_alert', ...data }));
}
