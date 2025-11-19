import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { VerifyPaymentSchema } from '@/lib/schemas/payment-schema';
import { validateBody } from '@/lib/api-validation';
import { ApiError } from '@/lib/api-error';
import crypto from 'crypto';
import { getRazorpayCredentials } from '@/lib/env';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

function requireAuth(token) {
  if (!token?.sub) {
    return null;
  }
  return Number(token.sub);
}

function verifySignature({ orderId, paymentId, signature }) {
  const { RAZORPAY_KEY_SECRET } = getRazorpayCredentials();
  if (!RAZORPAY_KEY_SECRET) {
    throw new ApiError(500, 'Payment configuration error');
  }
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(body).digest('hex');
  return expected === signature;
}

export async function POST(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = requireAuth(token);
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    const json = await request.json();
    const payload = await validateBody(VerifyPaymentSchema, json);

    // Normalize payload to snake_case for Razorpay
    const normalizedPayload = {
      razorpay_order_id: payload.razorpay_order_id || payload.orderId,
      razorpay_payment_id: payload.razorpay_payment_id || payload.paymentId,
      razorpay_signature: payload.razorpay_signature || payload.signature,
    };

    const valid = verifySignature({
      orderId: normalizedPayload.razorpay_order_id,
      paymentId: normalizedPayload.razorpay_payment_id,
      signature: normalizedPayload.razorpay_signature,
    });
    if (!valid) {
      throw new ApiError(400, 'Signature mismatch');
    }

    // Update order status in database if exists
    const order = await prisma.serviceRequest.findFirst({
      where: { razorpayOrderId: normalizedPayload.razorpay_order_id },
    });

    if (order) {
      await prisma.serviceRequest.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'completed',
          razorpayPaymentId: normalizedPayload.razorpay_payment_id,
        },
      });

      logger.info({
        event: 'payment_verified',
        userId,
        orderId: order.id,
        paymentId: normalizedPayload.razorpay_payment_id,
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        orderId: normalizedPayload.razorpay_order_id,
        paymentId: normalizedPayload.razorpay_payment_id,
        verified: true,
      },
    });
  } catch (err) {
    logger.error({
      event: 'payment_verify_error',
      error: err.message,
    });

    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
