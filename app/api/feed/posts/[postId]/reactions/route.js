import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { createRequestId, jsonError, jsonOk } from '@/lib/http';

export const dynamic = 'force-dynamic';

const ReactionSchema = z.object({
  type: z.enum(['like', 'celebrate', 'support', 'insightful', 'question']),
  action: z.enum(['add', 'remove']),
});

/**
 * POST /api/feed/posts/[postId]/reactions
 * Add or remove a reaction (like, celebrate, support, insightful, question)
 */
export async function POST(request, { params }) {
  const rid = createRequestId();

  try {
    // Optional per-route limiter
    try {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const key = `${ip}:${request.nextUrl?.pathname || '/api/feed/posts/[postId]/reactions'}`;
      if (typeof rateLimit === 'function') {
        const ok = await rateLimit(key, 60, 60);
        if (!ok) return jsonError('too_many_requests', 'Too many requests', 429, rid);
      }
    } catch {}

    const token = await getToken({ req: request });
    if (!token?.sub) {
      return jsonError('unauthorized', 'Unauthorized', 401, rid);
    }

    const userId = z.coerce.number().int().positive().parse(token.sub);
    const postId = z.coerce.number().int().positive().safeParse(params.postId);
    if (!postId.success) {
      return jsonError('invalid_params', 'Invalid post id', 400, rid);
    }

    const body = await request.json().catch(() => ({}));
    const parsed = ReactionSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('invalid_params', 'Invalid reaction type or action', 400, rid);
    }

    const { type, action } = parsed.data;

    if (action === 'remove') {
      await prisma.feedInteraction.deleteMany({
        where: {
          postId: postId.data,
          userId,
          type,
        },
      });

      // Get updated reaction counts
      const reactions = await prisma.feedInteraction.groupBy({
        by: ['type'],
        where: { postId: postId.data },
        _count: true,
      });

      const reactionCounts = reactions.reduce((acc, r) => {
        acc[r.type] = r._count;
        return acc;
      }, {});

      return jsonOk({ reacted: false, type, reactionCounts }, rid);
    }

    // Add reaction
    await prisma.feedInteraction.upsert({
      where: {
        postId_userId_type: {
          postId: postId.data,
          userId,
          type,
        },
      },
      create: {
        postId: postId.data,
        userId,
        type,
      },
      update: {},
    });

    // Get updated reaction counts
    const reactions = await prisma.feedInteraction.groupBy({
      by: ['type'],
      where: { postId: postId.data },
      _count: true,
    });

    const reactionCounts = reactions.reduce((acc, r) => {
      acc[r.type] = r._count;
      return acc;
    }, {});

    // Get user's reactions for this post
    const userReactions = await prisma.feedInteraction.findMany({
      where: {
        postId: postId.data,
        userId,
      },
      select: { type: true },
    });

    return jsonOk(
      {
        reacted: true,
        type,
        reactionCounts,
        userReactions: userReactions.map(r => r.type),
      },
      rid
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'error',
        rid,
        route: '/api/feed/posts/[postId]/reactions',
        msg: 'POST failed',
        err: String(error),
      })
    );
    return jsonError('internal_error', 'Unable to update reaction', 500, rid);
  }
}

/**
 * GET /api/feed/posts/[postId]/reactions
 * Get all reactions for a post
 */
export async function GET(request, { params }) {
  const rid = createRequestId();

  try {
    const token = await getToken({ req: request });
    const userId = token?.sub ? z.coerce.number().int().positive().parse(token.sub) : null;

    const postId = z.coerce.number().int().positive().safeParse(params.postId);
    if (!postId.success) {
      return jsonError('invalid_params', 'Invalid post id', 400, rid);
    }

    // Get all reaction counts
    const reactions = await prisma.feedInteraction.groupBy({
      by: ['type'],
      where: { postId: postId.data },
      _count: true,
    });

    const reactionCounts = reactions.reduce((acc, r) => {
      acc[r.type] = r._count;
      return acc;
    }, {});

    // Get user's reactions if authenticated
    let userReactions = [];
    if (userId) {
      const userReacts = await prisma.feedInteraction.findMany({
        where: {
          postId: postId.data,
          userId,
        },
        select: { type: true },
      });
      userReactions = userReacts.map(r => r.type);
    }

    return jsonOk({ reactionCounts, userReactions }, rid);
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'error',
        rid,
        route: '/api/feed/posts/[postId]/reactions',
        msg: 'GET failed',
        err: String(error),
      })
    );
    return jsonError('internal_error', 'Unable to fetch reactions', 500, rid);
  }
}

