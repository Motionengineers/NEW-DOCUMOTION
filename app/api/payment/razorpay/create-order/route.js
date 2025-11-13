import { NextResponse } from 'next/server';
import { z } from 'zod';
import Razorpay from 'razorpay';
import { getRazorpayCredentials } from '@/lib/env';

export const dynamic = 'force-dynamic';

const createOrderSchema = z.object({
  amount: z.number().positive().finite(),
  currency: z.string().optional().default('INR'),
  receipt: z.string().optional(),
  notes: z.record(z.string()).optional(),
  customer: z
    .object({
      name: z.string().optional(),
      contact: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
});

function getClient() {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = getRazorpayCredentials();
  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const payload = createOrderSchema.parse(body);

    const amountPaise = Math.round(payload.amount * 100);

    const client = getClient();
    const order = await client.orders.create({
      amount: amountPaise,
      currency: payload.currency,
      receipt: payload.receipt ?? `documotion_${Date.now()}`,
      payment_capture: 1,
      notes: {
        channel: 'documotion_branding_hub',
        ...(payload.notes ?? {}),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        order,
        key: getRazorpayCredentials().RAZORPAY_KEY_ID,
        preferredMethod: 'upi',
        customer: payload.customer ?? null,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload', details: error.flatten() },
        { status: 422 }
      );
    }
    console.error('POST /api/payment/razorpay/create-order failed:', error);
    return NextResponse.json({ success: false, error: 'Unable to create Razorpay order' }, { status: 500 });
  }
}

