import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { createRequestId, jsonError } from '@/lib/http';

export const dynamic = 'force-dynamic';

function serializeComment(comment) {
  return {
    id: comment.id,
    body: comment.body,
    parentCommentId: comment.parentCommentId,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    author: comment.author
      ? {
          id: comment.author.id,
          name: comment.author.name,
          image: comment.author.image,
        }
      : null,
    replyCount: comment._count?.replies ?? 0,
    replies: comment.replies?.map(reply => serializeComment(reply)) ?? [],
  };
}

export async function GET(_request, { params }) {
  try {
    const postId = z.coerce.number().int().positive().parse(params.postId);

    const comments = await prisma.feedComment.findMany({
      where: { postId, parentCommentId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { replies: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, name: true, image: true } } },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: comments.map(comment => serializeComment(comment)),
    });
  } catch (error) {
    console.error('GET /api/feed/posts/[postId]/comments failed:', error);
    return NextResponse.json({ success: false, error: 'Unable to load comments' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const rid = createRequestId();
  try {
    // Optional limiter (fail-open)
    try {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const key = `${ip}:${request.nextUrl?.pathname || '/api/feed/posts/[postId]/comments'}`;
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

    const BodySchema = z.object({
      body: z.string().trim().min(1, 'Comment cannot be empty'),
      parentCommentId: z.coerce.number().int().positive().optional().nullable(),
    });
    const parsed = BodySchema.safeParse(await request.json());
    if (!parsed.success) return jsonError('invalid_body', 'Invalid comment', 400, rid);
    const { body: text, parentCommentId } = parsed.data;

    const parentIdOrNull = parentCommentId ?? null;

    const created = await prisma.feedComment.create({
      data: {
        postId: postId.data,
        authorUserId: userId,
        body: text,
        parentCommentId: parentIdOrNull,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, name: true, image: true } } },
        },
        _count: { select: { replies: true } },
      },
    });

    return NextResponse.json({ success: true, data: serializeComment(created) }, { headers: { 'x-request-id': rid } });
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      rid,
      route: '/api/feed/posts/[postId]/comments',
      msg: 'POST failed',
      err: String(error),
    }));
    return jsonError('internal_error', 'Unable to add comment', 500, rid);
  }
}
