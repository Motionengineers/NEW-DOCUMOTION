import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createRequestId, jsonError, jsonOk } from '@/lib/http';

export const dynamic = 'force-dynamic';

const FollowSchema = z.object({
  targetUserId: z.coerce.number().int().positive().optional(),
  targetStartupId: z.coerce.number().int().positive().optional(),
  tag: z.string().optional(),
  action: z.enum(['follow', 'unfollow']),
});

/**
 * POST /api/feed/follow
 * Follow or unfollow a user, startup, or tag
 */
export async function POST(request) {
  const rid = createRequestId();

  try {
    const token = await getToken({ req: request });
    if (!token?.sub) {
      return jsonError('unauthorized', 'Unauthorized', 401, rid);
    }

    const followerUserId = z.coerce.number().int().positive().parse(token.sub);
    const body = await request.json();
    const parsed = FollowSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('invalid_params', 'Invalid request body', 400, rid);
    }

    const { targetUserId, targetStartupId, tag, action } = parsed.data;

    // Validate that at least one target is provided
    if (!targetUserId && !targetStartupId && !tag) {
      return jsonError('invalid_params', 'Must provide targetUserId, targetStartupId, or tag', 400, rid);
    }

    // Prevent self-follow
    if (targetUserId && targetUserId === followerUserId) {
      return jsonError('invalid_params', 'Cannot follow yourself', 400, rid);
    }

    if (action === 'follow') {
      // Check if already following
      const existing = await prisma.feedFollow.findFirst({
        where: {
          followerUserId,
          targetUserId: targetUserId || null,
          targetStartupId: targetStartupId || null,
          tag: tag || null,
        },
      });

      if (existing) {
        return jsonOk({ following: true }, rid);
      }

      await prisma.feedFollow.create({
        data: {
          followerUserId,
          targetUserId: targetUserId || null,
          targetStartupId: targetStartupId || null,
          tag: tag || null,
        },
      });

      return jsonOk({ following: true }, rid);
    } else {
      // Unfollow
      await prisma.feedFollow.deleteMany({
        where: {
          followerUserId,
          targetUserId: targetUserId || null,
          targetStartupId: targetStartupId || null,
          tag: tag || null,
        },
      });

      return jsonOk({ following: false }, rid);
    }
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', rid, route: '/api/feed/follow', msg: String(error) }));
    return jsonError('internal_error', 'An unexpected error occurred', 500, rid);
  }
}

/**
 * GET /api/feed/follow
 * Check follow status and get following list
 */
export async function GET(request) {
  const rid = createRequestId();

  try {
    const token = await getToken({ req: request });
    if (!token?.sub) {
      return jsonError('unauthorized', 'Unauthorized', 401, rid);
    }

    const userId = z.coerce.number().int().positive().parse(token.sub);
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('targetUserId')
      ? z.coerce.number().int().positive().parse(searchParams.get('targetUserId'))
      : null;
    const targetStartupId = searchParams.get('targetStartupId')
      ? z.coerce.number().int().positive().parse(searchParams.get('targetStartupId'))
      : null;
    const tag = searchParams.get('tag') || null;

    if (targetUserId || targetStartupId || tag) {
      // Check specific follow status
      const follow = await prisma.feedFollow.findFirst({
        where: {
          followerUserId: userId,
          targetUserId: targetUserId || null,
          targetStartupId: targetStartupId || null,
          tag: tag || null,
        },
      });

      return jsonOk({ following: Boolean(follow) }, rid);
    }

    // Get all follows for user
    const follows = await prisma.feedFollow.findMany({
      where: { followerUserId: userId },
      include: {
        targetUser: { select: { id: true, name: true, image: true } },
        targetStartup: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return jsonOk(
      {
        follows: follows.map(f => ({
          id: f.id,
          targetUserId: f.targetUserId,
          targetStartupId: f.targetStartupId,
          tag: f.tag,
          targetUser: f.targetUser,
          targetStartup: f.targetStartup,
          createdAt: f.createdAt,
        })),
      },
      rid
    );
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', rid, route: '/api/feed/follow', msg: String(error) }));
    return jsonError('internal_error', 'An unexpected error occurred', 500, rid);
  }
}

