import { z } from 'zod';

export const VerifyPaymentSchema = z.object({
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
  orderId: z.string().optional(),
  paymentId: z.string().optional(),
  signature: z.string().optional(),
});
