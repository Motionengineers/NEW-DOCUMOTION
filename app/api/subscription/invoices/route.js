import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/subscription/invoices
 * Get all invoices for the current user
 */
export async function GET(request) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(token.userId);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          subscription: {
            select: {
              id: true,
              tier: true,
              billingCycle: true,
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: invoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        amount: inv.amount,
        totalAmount: inv.totalAmount,
        taxAmount: inv.taxAmount,
        discountAmount: inv.discountAmount,
        currency: inv.currency,
        status: inv.status,
        items: JSON.parse(inv.items || '[]'),
        dueDate: inv.dueDate,
        paidAt: inv.paidAt,
        createdAt: inv.createdAt,
        subscription: inv.subscription,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/subscription/invoices
 * Create a new invoice (typically called after payment)
 */
export async function POST(request) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(token.userId);
    const body = await request.json();
    const {
      subscriptionId,
      amount,
      items,
      taxAmount = 0,
      discountAmount = 0,
      razorpayOrderId,
      razorpayPaymentId,
    } = body;

    if (!subscriptionId || !amount || !items) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify subscription belongs to user
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: parseInt(subscriptionId),
        userId,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const totalAmount = amount + taxAmount - discountAmount;

    const invoice = await prisma.invoice.create({
      data: {
        subscriptionId: parseInt(subscriptionId),
        userId,
        invoiceNumber,
        amount,
        totalAmount,
        taxAmount,
        discountAmount,
        items: JSON.stringify(items),
        razorpayOrderId: razorpayOrderId || null,
        razorpayPaymentId: razorpayPaymentId || null,
        status: razorpayPaymentId ? 'paid' : 'pending',
        paidAt: razorpayPaymentId ? new Date() : null,
      },
      include: {
        subscription: {
          select: {
            id: true,
            tier: true,
            billingCycle: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        totalAmount: invoice.totalAmount,
        status: invoice.status,
        items: JSON.parse(invoice.items),
        createdAt: invoice.createdAt,
        subscription: invoice.subscription,
      },
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


