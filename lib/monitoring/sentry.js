import { logger } from '@/lib/logger';

export function captureException(error, context = {}) {
  if (process.env.SENTRY_DSN) {
    logger.error({
      event: 'sentry_capture',
      message: error?.message,
      stack: error?.stack,
      context,
    });
    return;
  }

  logger.error({
    event: 'exception',
    message: error?.message,
    stack: error?.stack,
    context,
  });
}
