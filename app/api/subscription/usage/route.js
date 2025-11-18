import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Tier limits configuration
const TIER_LIMITS = {
  freemium: {
    workspaces: 1,
    uploads: 3,
    aiActions: 0,
    storage: 0,
    teamSeats: 1,
    autoApplyWorkflows: 0,
    aiParsingPages: 0,
    partnerBookings: 0,
  },
  growth: {
    workspaces: 3,
    uploads: 100,
    aiActions: 50,
    storage: 25,
    teamSeats: 5,
    autoApplyWorkflows: 3,
    aiParsingPages: 500,
    partnerBookings: 5,
  },
  scale: {
    workspaces: -1, // unlimited
    uploads: -1,
    aiActions: -1,
    storage: 100,
    teamSeats: 15,
    autoApplyWorkflows: 10,
    aiParsingPages: 500,
    partnerBookings: -1,
  },
  concierge: {
    workspaces: -1,
    uploads: -1,
    aiActions: -1,
    storage: -1,
    teamSeats: -1,
    autoApplyWorkflows: -1,
    aiParsingPages: -1,
    partnerBookings: -1,
  },
};

export async function GET(request) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(token.userId);

    // Get active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        addOns: {
          where: { status: 'active' },
        },
      },
    });

    const tier = subscription?.tier || 'freemium';
    const baseLimits = TIER_LIMITS[tier] || TIER_LIMITS.freemium;

    // Get usage tracking
    const usageRecords = await prisma.usageTracking.findMany({
      where: {
        userId,
        subscriptionId: subscription?.id || null,
      },
      orderBy: { periodStart: 'desc' },
    });

    // Calculate current usage
    const usage = {};
    const now = new Date();
    const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Aggregate usage by metric type
    for (const record of usageRecords) {
      if (record.periodStart >= currentPeriodStart) {
        const key = record.metricType;
        if (!usage[key]) {
          usage[key] = { current: 0, limit: baseLimits[key] || null };
        }
        usage[key].current += record.currentUsage;
      }
    }

    // Apply add-on limits
    if (subscription?.addOns) {
      for (const addOn of subscription.addOns) {
        if (addOn.addOnType === 'storage_10gb') {
          usage.storage_gb = usage.storage_gb || { current: 0, limit: baseLimits.storage || 0 };
          usage.storage_gb.limit += 10 * addOn.quantity;
        } else if (addOn.addOnType === 'extra_seat') {
          usage.team_seats = usage.team_seats || { current: 0, limit: baseLimits.teamSeats || 0 };
          usage.team_seats.limit += addOn.quantity;
        } else if (addOn.addOnType === 'auto_apply_workflow') {
          usage.auto_apply_workflows = usage.auto_apply_workflows || {
            current: 0,
            limit: baseLimits.autoApplyWorkflows || 0,
          };
          usage.auto_apply_workflows.limit += addOn.quantity;
        } else if (addOn.addOnType === 'ai_parsing_pages') {
          usage.ai_parsing_pages = usage.ai_parsing_pages || {
            current: 0,
            limit: baseLimits.aiParsingPages || 0,
          };
          usage.ai_parsing_pages.limit += 100 * addOn.quantity; // Each add-on = 100 pages
        }
      }
    }

    // Initialize missing metrics
    for (const [key, limit] of Object.entries(baseLimits)) {
      const metricKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (!usage[metricKey]) {
        usage[metricKey] = { current: 0, limit: limit === -1 ? null : limit };
      }
    }

    return NextResponse.json({
      success: true,
      usage,
      subscription: subscription
        ? {
            id: subscription.id,
            tier: subscription.tier,
            billingCycle: subscription.billingCycle,
            status: subscription.status,
            expiresAt: subscription.expiresAt,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching usage:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

