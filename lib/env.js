const { z } = require('zod');

const CONFIG_ERROR_NAME = 'ConfigError';

const razorpaySchema = z.object({
  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
});

const queueSchema = z.object({
  REDIS_URL: z.string().min(1, 'REDIS_URL is required for the auto-submit queue'),
  QUEUE_PREFIX: z
    .string()
    .min(1, 'QUEUE_PREFIX must be at least 1 character')
    .default('documotion'),
  AUTO_SUBMIT_CONCURRENCY: z
    .preprocess(val => {
      if (val === undefined || val === null || val === '') return undefined;
      const parsed = Number(val);
      return Number.isNaN(parsed) ? undefined : parsed;
    }, z.number().int().min(1).max(10))
    .default(3),
});

const submissionStorageSchema = z.object({
  SUBMISSION_RECEIPTS_BUCKET: z.string().min(1).optional(),
});

let cachedCredentials = null;
let cachedQueueConfig = null;
let cachedSubmissionStorage = null;

function wrapConfigError(message) {
  const error = new Error(message);
  error.name = CONFIG_ERROR_NAME;
  return error;
}

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
    throw wrapConfigError(`Missing Razorpay configuration: ${message}`);
  }

  cachedCredentials = parsed.data;
  return cachedCredentials;
}

function getQueueConfig() {
  if (cachedQueueConfig) return cachedQueueConfig;

  const parsed = queueSchema.safeParse({
    REDIS_URL: process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL,
    QUEUE_PREFIX: process.env.QUEUE_PREFIX,
    AUTO_SUBMIT_CONCURRENCY: process.env.AUTO_SUBMIT_CONCURRENCY,
  });

  if (!parsed.success) {
    const message = parsed.error.errors.map(err => err.message).join('; ');
    throw wrapConfigError(`Missing queue configuration: ${message}`);
  }

  cachedQueueConfig = parsed.data;
  return cachedQueueConfig;
}

function getSubmissionStorageConfig() {
  if (cachedSubmissionStorage) return cachedSubmissionStorage;

  const parsed = submissionStorageSchema.safeParse({
    SUBMISSION_RECEIPTS_BUCKET:
      process.env.SUBMISSION_RECEIPTS_BUCKET || process.env.AWS_S3_BUCKET,
  });

  if (!parsed.success) {
    const message = parsed.error.errors.map(err => err.message).join('; ');
    throw wrapConfigError(`Missing submission storage configuration: ${message}`);
  }

  cachedSubmissionStorage = parsed.data;
  return cachedSubmissionStorage;
}

module.exports = {
  getRazorpayCredentials,
  getQueueConfig,
  getSubmissionStorageConfig,
};
