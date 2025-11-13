import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { getRazorpayCredentials } from '@/lib/env';

export const dynamic = 'force-dynamic';

const verifySchema = z.object({
  orderId: z.string().min(10),
  paymentId: z.string().min(10),
  signature: z.string().min(10),
});

function verifySignature({ orderId, paymentId, signature }) {
  const { RAZORPAY_KEY_SECRET } = getRazorpayCredentials();
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(body).digest('hex');
  return expected === signature;
}

export async function POST(request) {
  try {
    const json = await request.json();
    const payload = verifySchema.parse(json);

    const valid = verifySignature(payload);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Signature mismatch' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: { orderId: payload.orderId, paymentId: payload.paymentId },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload', details: error.flatten() },
        { status: 422 }
      );
    }
    console.error('POST /api/payment/razorpay/verify failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to verify payment' },
      { status: 500 }
    );
  }
}
