import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ADDON_PRICING = {
  storage_10gb: 499,
  extra_seat: 399,
  auto_apply_workflow: 299,
  ai_parsing_pages: 3, // per 100 pages
};

export async function POST(request) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(token.userId);
    const body = await request.json();
    const { addOnType, quantity = 1 } = body;

    if (!addOnType || !ADDON_PRICING[addOnType]) {
      return NextResponse.json({ success: false, error: 'Invalid add-on type' }, { status: 400 });
    }

    // Get active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return NextResponse.json({ success: false, error: 'No active subscription' }, { status: 400 });
    }

    // Calculate price
    const unitPrice = ADDON_PRICING[addOnType];
    const totalPrice = unitPrice * quantity;

    // Create add-on
    const addOn = await prisma.subscriptionAddOn.create({
      data: {
        subscriptionId: subscription.id,
        addOnType,
        quantity,
        pricePerUnit: unitPrice,
        status: 'active',
        purchasedAt: new Date(),
        expiresAt: subscription.expiresAt, // Expires with subscription
      },
    });

    return NextResponse.json({
      success: true,
      addOn: {
        id: addOn.id,
        addOnType: addOn.addOnType,
        quantity: addOn.quantity,
        pricePerUnit: addOn.pricePerUnit,
      },
      // In production, return Razorpay order details
      payment: {
        amount: totalPrice,
        currency: 'INR',
        orderId: `addon_${addOn.id}`,
      },
    });
  } catch (error) {
    console.error('Error purchasing add-on:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

