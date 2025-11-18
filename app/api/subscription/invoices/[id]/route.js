import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const ParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

function jsonError(code, message, status, rid) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status, headers: { 'x-request-id': rid } }
  );
}

/**
 * GET /api/subscription/invoices/[id]
 * Get a specific invoice
 */
export async function GET(request, { params }) {
  const rid = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

  try {
    // Optional: per-route rate limit (fail-open on internal errors)
    try {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const key = `${ip}:${request.nextUrl?.pathname || '/api/subscription/invoices/[id]'}`;
      if (typeof rateLimit === 'function') {
        const ok = await rateLimit(key, 60, 60);
        if (!ok) return jsonError('too_many_requests', 'Too many requests', 429, rid);
      }
    } catch {
      // ignore limiter failures
    }

    // Validate and coerce path param
    const parsedParams = ParamsSchema.safeParse(params);
    if (!parsedParams.success) {
      return jsonError('invalid_params', 'Invalid invoice id', 400, rid);
    }
    const invoiceId = parsedParams.data.id;

    // AuthN
    const token = await getToken({ req: request });
    if (!token || token.userId == null) {
      return jsonError('unauthorized', 'Unauthorized', 401, rid);
    }

    // Coerce userId
    const parsedUserId = z.coerce.number().int().positive().safeParse(token.userId);
    if (!parsedUserId.success) {
      return jsonError('unauthorized', 'Unauthorized', 401, rid);
    }
    const userId = parsedUserId.data;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId,
      },
      include: {
        subscription: {
          select: {
            id: true,
            tier: true,
            billingCycle: true,
            status: true,
          },
        },
      },
    });

    if (!invoice) {
      return jsonError('not_found', 'Invoice not found', 404, rid);
    }

    // Safe parse for items
    let items = [];
    if (invoice.items) {
      try {
        const parsed = JSON.parse(invoice.items);
        if (Array.isArray(parsed)) items = parsed;
      } catch {
        items = [];
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        totalAmount: invoice.totalAmount,
        taxAmount: invoice.taxAmount,
        discountAmount: invoice.discountAmount,
        currency: invoice.currency,
        status: invoice.status,
        items,
        razorpayOrderId: invoice.razorpayOrderId,
        razorpayPaymentId: invoice.razorpayPaymentId,
        dueDate: invoice.dueDate,
        paidAt: invoice.paidAt,
        createdAt: invoice.createdAt,
        subscription: invoice.subscription,
      },
    }, { headers: { 'x-request-id': rid } });
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      rid,
      route: '/api/subscription/invoices/[id]',
      msg: 'Error fetching invoice',
      err: String(error),
    }));
    return jsonError('internal_error', 'An unexpected error occurred', 500, rid);
  }
}


