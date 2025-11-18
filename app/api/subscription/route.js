import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getUserSubscription, getUserTier, TIER_LIMITS } from '@/lib/subscription';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/subscription
 * Get current subscription details with limits and add-ons
 */
export async function GET(request) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(token.userId);
    const subscription = await getUserSubscription(userId);
    const tier = await getUserTier(userId);
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.freemium;

    // Get active add-ons
    const addOns = subscription?.addOns || [];

    // Calculate effective limits (base + add-ons)
    const effectiveLimits = { ...limits };
    for (const addOn of addOns) {
      if (addOn.addOnType === 'storage_10gb') {
        effectiveLimits.storage = (effectiveLimits.storage || 0) + 10 * addOn.quantity;
      } else if (addOn.addOnType === 'extra_seat') {
        effectiveLimits.teamSeats = (effectiveLimits.teamSeats || 0) + addOn.quantity;
      } else if (addOn.addOnType === 'auto_apply_workflow') {
        effectiveLimits.autoApplyWorkflows = (effectiveLimits.autoApplyWorkflows || 0) + addOn.quantity;
      } else if (addOn.addOnType === 'ai_parsing_pages') {
        effectiveLimits.aiParsingPages = (effectiveLimits.aiParsingPages || 0) + 100 * addOn.quantity;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        subscription: subscription
          ? {
              id: subscription.id,
              tier: subscription.tier,
              billingCycle: subscription.billingCycle,
              status: subscription.status,
              startedAt: subscription.startedAt,
              expiresAt: subscription.expiresAt,
              cancelledAt: subscription.cancelledAt,
              razorpayId: subscription.razorpayId,
            }
          : null,
        tier,
        limits: effectiveLimits,
        addOns: addOns.map(a => ({
          id: a.id,
          type: a.addOnType,
          quantity: a.quantity,
          status: a.status,
          purchasedAt: a.purchasedAt,
          expiresAt: a.expiresAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


