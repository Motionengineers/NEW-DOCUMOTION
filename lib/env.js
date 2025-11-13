const { z } = require('zod');

const razorpaySchema = z.object({
  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
});

let cachedCredentials = null;

function getRazorpayCredentials() {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  const parsed = razorpaySchema.safeParse({
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  });

  if (!parsed.success) {
    const message = parsed.error.errors.map(err => err.message).join('; ');
    const error = new Error(`Missing Razorpay configuration: ${message}`);
    error.name = 'ConfigError';
    throw error;
  }

  cachedCredentials = parsed.data;
  return cachedCredentials;
}

module.exports = {
  getRazorpayCredentials,
};
