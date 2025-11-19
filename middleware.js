/**
 * Production Rate Limiting Middleware
 * 
 * Protects all /api/* routes with Upstash Redis rate limiting
 * Configured: 50 requests per minute per IP
 * 
 * Environment variables required:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = Redis.fromEnv();

// Initialize rate limiter
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, '1 m'), // 50 requests per minute
  analytics: true,
  prefix: '@documotion/ratelimit',
});

export async function middleware(req) {
  // Only apply rate limiting to API routes
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  try {
    // Get client IP
    const ip =
      req.ip ??
      req.headers.get('x-forwarded-for')?.split(',')[0] ??
      req.headers.get('x-real-ip') ??
      'unknown';

    // Check rate limit
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    // Add rate limit headers
    const response = success
      ? NextResponse.next()
      : NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', reset.toString());

    if (!success) {
      return response;
    }

    return response;
  } catch (error) {
    // If rate limiting fails, log but don't block the request
    console.error('[Rate Limit Error]', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
