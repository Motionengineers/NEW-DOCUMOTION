import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { getRazorpayCredentials } from '@/lib/env';
import { createRequestId, jsonError } from '@/lib/http';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payment/razorpay/webhook
 * Handle Razorpay webhook events
 */
export async function POST(request) {
  const rid = createRequestId();
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return jsonError('missing_signature', 'Missing signature', 400, rid);
    }

    // Verify webhook signature
    const { RAZORPAY_KEY_SECRET } = getRazorpayCredentials();
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error(JSON.stringify({ level: 'warn', rid, msg: 'Webhook signature mismatch' }));
      return jsonError('invalid_signature', 'Invalid signature', 401, rid);
    }

    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    console.log(JSON.stringify({ level: 'info', rid, msg: 'Razorpay webhook received', eventType }));

    // Handle different event types
    switch (eventType) {
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity, rid);
        break;

      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity, rid);
        break;

      case 'order.paid':
        await handleOrderPaid(payload.order.entity, rid);
        break;

      case 'subscription.charged':
        await handleSubscriptionCharged(payload.subscription.entity, rid);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload.subscription.entity, rid);
        break;

      default:
        console.log(JSON.stringify({ level: 'info', rid, msg: 'Unhandled webhook event', eventType }));
    }

    return NextResponse.json({ success: true, received: true }, { headers: { 'x-request-id': rid } });
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', rid, msg: 'Webhook processing error', err: String(error) }));
    return jsonError('internal_error', 'Webhook processing failed', 500, rid);
  }
}

async function handlePaymentCaptured(payment, rid) {
  try {
    const { order_id, id: paymentId, amount, status } = payment;

    // Find subscription by Razorpay order ID
    const subscription = await prisma.subscription.findFirst({
      where: {
        razorpayId: order_id,
      },
      include: {
        user: true,
      },
    });

    if (!subscription) {
      console.error(JSON.stringify({ level: 'warn', rid, msg: 'Subscription not found for order', order_id }));
      return;
    }

    // Update subscription status
    if (status === 'captured') {
      // Idempotency: skip if invoice for this payment already exists
      const existingInvoice = await prisma.invoice.findFirst({
        where: { razorpayPaymentId: paymentId },
      });
      if (existingInvoice) {
        console.log(JSON.stringify({ level: 'info', rid, msg: 'Duplicate payment captured ignored', paymentId }));
        return;
      }

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'active',
          razorpayId: order_id,
        },
      });

      // Create invoice
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      await prisma.invoice.create({
        data: {
          subscriptionId: subscription.id,
          userId: subscription.userId,
          invoiceNumber,
          amount: amount / 100, // Convert from paise to rupees
          totalAmount: amount / 100,
          currency: 'INR',
          status: 'paid',
          razorpayOrderId: order_id,
          razorpayPaymentId: paymentId,
          items: JSON.stringify([
            {
              description: `${subscription.tier} Plan - ${subscription.billingCycle}`,
              quantity: 1,
              amount: amount / 100,
            },
          ]),
          paidAt: new Date(),
        },
      });

      console.log(JSON.stringify({ level: 'info', rid, msg: 'Payment captured processed', subscriptionId: subscription.id }));
    }
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', rid, msg: 'Error handling payment captured', err: String(error) }));
    throw error;
  }
}

async function handlePaymentFailed(payment, rid) {
  try {
    const { order_id, id: paymentId, amount } = payment;

    // Idempotency: skip if a failed invoice exists for this payment
    const existingInvoice = await prisma.invoice.findFirst({
      where: { razorpayPaymentId: paymentId, status: 'failed' },
    });
    if (existingInvoice) {
      console.log(JSON.stringify({ level: 'info', rid, msg: 'Duplicate payment failed ignored', paymentId }));
      return;
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        razorpayId: order_id,
      },
    });

    if (subscription) {
      // Create failed invoice
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      await prisma.invoice.create({
        data: {
          subscriptionId: subscription.id,
          userId: subscription.userId,
          invoiceNumber,
          amount: amount / 100,
          totalAmount: amount / 100,
          currency: 'INR',
          status: 'failed',
          razorpayOrderId: order_id,
          razorpayPaymentId: paymentId,
          items: JSON.stringify([
            {
              description: `${subscription.tier} Plan - ${subscription.billingCycle}`,
              quantity: 1,
              amount: amount / 100,
            },
          ]),
        },
      });

      console.log(JSON.stringify({ level: 'info', rid, msg: 'Payment failed recorded', subscriptionId: subscription.id }));
    }
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', rid, msg: 'Error handling payment failed', err: String(error) }));
    throw error;
  }
}

async function handleOrderPaid(order, rid) {
  // Similar to handlePaymentCaptured
  await handlePaymentCaptured({ order_id: order.id, ...order }, rid);
}

async function handleSubscriptionCharged(subscription, rid) {
  try {
    const { id: razorpaySubscriptionId, current_start, current_end, plan } = subscription;

    // Find subscription
    const sub = await prisma.subscription.findFirst({
      where: {
        razorpayId: razorpaySubscriptionId,
      },
    });

    if (sub) {
      // Update subscription dates
      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          status: 'active',
          startedAt: new Date(current_start * 1000),
          expiresAt: new Date(current_end * 1000),
        },
      });

      // Create invoice for renewal
      // Idempotency: skip if already invoiced for this charge id
      const existingInvoice = await prisma.invoice.findFirst({
        where: { razorpayOrderId: subscription.id, status: 'paid' },
      });
      if (existingInvoice) {
        console.log(JSON.stringify({ level: 'info', rid, msg: 'Duplicate subscription charge ignored', orderId: subscription.id }));
        return;
      }

      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      await prisma.invoice.create({
        data: {
          subscriptionId: sub.id,
          userId: sub.userId,
          invoiceNumber,
          amount: plan?.amount ? plan.amount / 100 : 0,
          totalAmount: plan?.amount ? plan.amount / 100 : 0,
          currency: 'INR',
          status: 'paid',
          razorpayOrderId: subscription.id,
          items: JSON.stringify([
            {
              description: `${sub.tier} Plan Renewal - ${sub.billingCycle}`,
              quantity: 1,
              amount: plan?.amount ? plan.amount / 100 : 0,
            },
          ]),
          paidAt: new Date(),
        },
      });

      console.log(JSON.stringify({ level: 'info', rid, msg: 'Subscription charged processed', subscriptionId: sub.id }));
    }
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', rid, msg: 'Error handling subscription charged', err: String(error) }));
    throw error;
  }
}

async function handleSubscriptionCancelled(subscription, rid) {
  try {
    const { id: razorpaySubscriptionId } = subscription;

    const sub = await prisma.subscription.findFirst({
      where: {
        razorpayId: razorpaySubscriptionId,
      },
    });

    if (sub) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      });

      console.log(JSON.stringify({ level: 'info', rid, msg: 'Subscription cancelled processed', subscriptionId: sub.id }));
    }
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', rid, msg: 'Error handling subscription cancelled', err: String(error) }));
    throw error;
  }
}

