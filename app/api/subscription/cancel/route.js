import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getUserSubscription } from '@/lib/subscription';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/subscription/cancel
 * Cancel current subscription (sets to cancel at end of billing period)
 */
export async function POST(request) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(token.userId);
    const body = await request.json().catch(() => ({}));
    const { immediate = false } = body;

    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Update subscription status
    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: immediate ? 'cancelled' : 'active', // Keep active until period ends if not immediate
        cancelledAt: new Date(),
        // If immediate, set expiresAt to now; otherwise keep current expiry
        ...(immediate && { expiresAt: new Date() }),
      },
    });

    // Cancel all active add-ons
    await prisma.subscriptionAddOn.updateMany({
      where: {
        subscriptionId: subscription.id,
        status: 'active',
      },
      data: {
        status: 'cancelled',
        expiresAt: immediate ? new Date() : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        subscription: {
          id: updated.id,
          tier: updated.tier,
          status: updated.status,
          cancelledAt: updated.cancelledAt,
          expiresAt: updated.expiresAt,
        },
        message: immediate
          ? 'Subscription cancelled immediately'
          : 'Subscription will cancel at end of billing period',
      },
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


