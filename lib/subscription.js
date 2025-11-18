import prisma from './prisma';

// Tier limits configuration (same as API)
export const TIER_LIMITS = {
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

/**
 * Get user's active subscription
 */
export async function getUserSubscription(userId) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: parseInt(userId),
      status: 'active',
    },
    orderBy: { createdAt: 'desc' },
    include: {
      addOns: {
        where: { status: 'active' },
      },
    },
  });

  return subscription;
}

/**
 * Get user's tier
 */
export async function getUserTier(userId) {
  const subscription = await getUserSubscription(userId);
  return subscription?.tier || 'freemium';
}

/**
 * Check if user has access to a feature
 */
export async function hasFeatureAccess(userId, feature) {
  const tier = await getUserTier(userId);
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.freemium;

  // Feature mapping
  const featureMap = {
    full_funding_applications: tier !== 'freemium',
    ai_branding_assistant: tier !== 'freemium',
    auto_apply_workflows: limits.autoApplyWorkflows > 0 || limits.autoApplyWorkflows === -1,
    branding_studio_pro: tier === 'scale' || tier === 'concierge',
    partner_marketplace: tier === 'scale' || tier === 'concierge',
    investor_crm: tier === 'scale' || tier === 'concierge',
    concierge_support: tier === 'concierge',
    unlimited_schemes: tier === 'scale' || tier === 'concierge',
  };

  return featureMap[feature] || false;
}

/**
 * Check if user can perform an action (usage-based)
 */
export async function canPerformAction(userId, actionType, quantity = 1) {
  const subscription = await getUserSubscription(userId);
  const tier = subscription?.tier || 'freemium';
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.freemium;

  // Get current usage
  const now = new Date();
  const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const usageRecord = await prisma.usageTracking.findFirst({
    where: {
      userId: parseInt(userId),
      subscriptionId: subscription?.id || null,
      metricType: actionType,
      periodStart: {
        gte: currentPeriodStart,
      },
    },
  });

  const currentUsage = usageRecord?.currentUsage || 0;
  const limit = limits[actionType] || 0;

  // Unlimited
  if (limit === -1) {
    return { allowed: true, remaining: null };
  }

  // Check if within limit
  const remaining = limit - currentUsage;
  const allowed = remaining >= quantity;

  return { allowed, remaining: Math.max(0, remaining), limit, current: currentUsage };
}

/**
 * Record usage for an action
 */
export async function recordUsage(userId, actionType, quantity = 1) {
  const subscription = await getUserSubscription(userId);
  const now = new Date();
  const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Find or create usage record
  let usageRecord = await prisma.usageTracking.findFirst({
    where: {
      userId: parseInt(userId),
      subscriptionId: subscription?.id || null,
      metricType: actionType,
      periodStart: currentPeriodStart,
    },
  });

  if (usageRecord) {
    // Update existing record
    usageRecord = await prisma.usageTracking.update({
      where: { id: usageRecord.id },
      data: {
        currentUsage: {
          increment: quantity,
        },
      },
    });
  } else {
    // Create new record
    const tier = subscription?.tier || 'freemium';
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.freemium;
    const limit = limits[actionType] || 0;

    usageRecord = await prisma.usageTracking.create({
      data: {
        userId: parseInt(userId),
        subscriptionId: subscription?.id,
        metricType: actionType,
        currentUsage: quantity,
        limit: limit === -1 ? null : limit,
        periodStart: currentPeriodStart,
        periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      },
    });
  }

  return usageRecord;
}

