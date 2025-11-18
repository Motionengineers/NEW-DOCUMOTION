import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { createRequestId, jsonError } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  const rid = createRequestId();
  try {
    // Optional per-route limiter (fail-open on error)
    try {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const key = `${ip}:${request.nextUrl?.pathname || '/api/feed/posts/[postId]/bookmark'}`;
      if (typeof rateLimit === 'function') {
        const ok = await rateLimit(key, 60, 60);
        if (!ok) return jsonError('too_many_requests', 'Too many requests', 429, rid);
      }
    } catch {}

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return jsonError('unauthorized', 'Unauthorized', 401, rid);
    }
    const userId = z.coerce.number().int().positive().parse(token.sub);
    const postId = z.coerce.number().int().positive().safeParse(params.postId);
    if (!postId.success) return jsonError('invalid_params', 'Invalid post id', 400, rid);

    const payload = await request.json().catch(() => ({}));
    const action = payload?.action === 'remove' ? 'remove' : 'add';
    const collection = payload?.collection || 'default';

    if (action === 'remove') {
      await prisma.feedBookmark.deleteMany({
        where: {
          postId: postId.data,
          userId,
        },
      });
      return NextResponse.json({ success: true, data: { bookmarked: false } }, { headers: { 'x-request-id': rid } });
    }

    await prisma.feedBookmark.upsert({
      where: {
        userId_postId: {
          userId,
          postId: postId.data,
        },
      },
      create: {
        userId,
        postId: postId.data,
        collection,
      },
      update: {
        collection,
      },
    });

    return NextResponse.json({ success: true, data: { bookmarked: true, collection } }, { headers: { 'x-request-id': rid } });
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      rid,
      route: '/api/feed/posts/[postId]/bookmark',
      msg: 'POST failed',
      err: String(error),
    }));
    return jsonError('internal_error', 'Unable to update bookmark', 500, rid);
  }
}
