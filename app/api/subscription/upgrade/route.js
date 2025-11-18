import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const TIER_PRICING = {
  growth: { monthly: 3499, annual: 34990 },
  scale: { monthly: 8999, annual: 89990 },
};

export async function POST(request) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(token.userId);
    const body = await request.json();
    const { tier, billingCycle = 'monthly' } = body;

    if (!tier || !['growth', 'scale'].includes(tier)) {
      return NextResponse.json({ success: false, error: 'Invalid tier' }, { status: 400 });
    }

    // Get current subscription
    const currentSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate price
    const price = TIER_PRICING[tier][billingCycle];

    // In production, this would integrate with Razorpay
    // For now, we'll create a subscription record
    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        tier,
        billingCycle,
        status: 'active',
        startedAt: new Date(),
        expiresAt:
          billingCycle === 'annual'
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Cancel old subscription if exists
    if (currentSubscription) {
      await prisma.subscription.update({
        where: { id: currentSubscription.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: newSubscription.id,
        tier: newSubscription.tier,
        billingCycle: newSubscription.billingCycle,
        status: newSubscription.status,
        expiresAt: newSubscription.expiresAt,
      },
      // In production, return Razorpay order details
      payment: {
        amount: price,
        currency: 'INR',
        orderId: `order_${newSubscription.id}`,
      },
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

