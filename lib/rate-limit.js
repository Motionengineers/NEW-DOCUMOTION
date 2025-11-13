const buckets = new Map();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

export function rateLimit(key, limit = MAX_REQUESTS, windowMs = WINDOW_MS) {
  const now = Date.now();
  const bucket = buckets.get(key) || { count: 0, expiresAt: now + windowMs };

  if (bucket.expiresAt < now) {
    bucket.count = 0;
    bucket.expiresAt = now + windowMs;
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  if (bucket.count > limit) {
    return false;
  }

  return true;
}

export function rateLimitFromRequest(request, limit, windowMs) {
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'anonymous';
  return rateLimit(ip, limit, windowMs);
}
