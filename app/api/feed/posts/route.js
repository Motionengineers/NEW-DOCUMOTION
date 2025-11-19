import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { createPostSchema } from '@/lib/api-validation';
import { validateBody, validateQuery } from '@/lib/api-validation';
import { ApiError } from '@/lib/api-error';
import prisma from '@/lib/prisma';
import { normaliseTag, serializePost } from '@/lib/feed/serializers';
import { logger } from '@/lib/logger';
import sanitizeHtml from 'sanitize-html';

const DEFAULT_PAGE_SIZE = 15;
const COMMENT_PREVIEW_LIMIT = 2;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursorParam = searchParams.get('cursor');
    const limitParam = Number.parseInt(searchParams.get('limit') ?? '', 10);
    const tagFilter = searchParams.get('tag');
    const tagsFilter = searchParams.getAll('tags');
    const stage = searchParams.get('stage');
    const industry = searchParams.get('industry');
    const location = searchParams.get('location');
    const professional = searchParams.get('professional');
    const mediaType = searchParams.get('mediaType');
    const q = searchParams.get('q');
    const sort = searchParams.get('sort');
    const following = searchParams.get('following') === 'true';

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.sub ? Number(token.sub) : null;

    const limit =
      Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : DEFAULT_PAGE_SIZE;

    const where = {};

    const tagList = [];
    if (tagFilter) tagList.push(tagFilter);
    if (tagsFilter?.length) tagList.push(...tagsFilter);
    const normalizedTags = Array.from(new Set(tagList.map(normaliseTag))).filter(Boolean);
    if (normalizedTags.length) {
      where.tags = {
        some: {
          tag: {
            in: normalizedTags,
          },
        },
      };
    }

    if (stage) {
      where.stage = stage;
    }
    if (industry) {
      where.industry = industry;
    }
    if (location) {
      where.location = location;
    }
    if (professional === 'true') {
      where.professional = true;
    } else if (professional === 'false') {
      where.professional = false;
    }
    if (mediaType) {
      where.mediaType = mediaType;
    }
    // Filter by following if requested
    if (following && userId) {
      const follows = await prisma.feedFollow.findMany({
        where: { followerUserId: userId },
        select: { targetUserId: true, targetStartupId: true },
      });

      const followedUserIds = follows.filter(f => f.targetUserId).map(f => f.targetUserId);
      const followedStartupIds = follows.filter(f => f.targetStartupId).map(f => f.targetStartupId);

      if (followedUserIds.length > 0 || followedStartupIds.length > 0) {
        const followConditions = [
          ...(followedUserIds.length > 0 ? [{ authorUserId: { in: followedUserIds } }] : []),
          ...(followedStartupIds.length > 0 ? [{ startupId: { in: followedStartupIds } }] : []),
        ];
        
        // Combine with search query if present
        if (q) {
          where.AND = [
            {
              OR: followConditions,
            },
            {
              OR: [
                { body: { contains: q, mode: 'insensitive' } },
                { linkTitle: { contains: q, mode: 'insensitive' } },
                { linkDescription: { contains: q, mode: 'insensitive' } },
                { tagList: { contains: q.toLowerCase(), mode: 'insensitive' } },
              ],
            },
          ];
        } else {
          where.OR = followConditions;
        }
      } else {
        // User follows no one, return empty
        return NextResponse.json({
          success: true,
          data: {
            posts: [],
            nextCursor: null,
          },
        });
      }
    } else if (q) {
      // Search query without following filter
      where.OR = [
        { body: { contains: q, mode: 'insensitive' } },
        { linkTitle: { contains: q, mode: 'insensitive' } },
        { linkDescription: { contains: q, mode: 'insensitive' } },
        { tagList: { contains: q.toLowerCase(), mode: 'insensitive' } },
      ];
    }

    const orderBy =
      sort === 'trending'
        ? [{ updatedAt: 'desc' }, { createdAt: 'desc' }]
        : [{ createdAt: 'desc' }];

    const posts = await prisma.feedPost.findMany({
      where,
      orderBy,
      take: limit + 1,
      ...(cursorParam
        ? {
            cursor: { id: Number(cursorParam) },
            skip: 1,
          }
        : {}),
      include: {
        author: { select: { id: true, name: true, image: true } },
        startup: { select: { id: true, name: true } },
        tags: true,
        media: true,
        interactions: {
          where: { type: 'like' },
          select: { userId: true },
        },
        bookmarks: userId
          ? {
              where: { userId },
              select: { userId: true },
            }
          : false,
        comments: {
          where: { parentCommentId: null },
          orderBy: { createdAt: 'desc' },
          take: COMMENT_PREVIEW_LIMIT,
          include: {
            author: { select: { id: true, name: true, image: true } },
            replies: {
              orderBy: { createdAt: 'asc' },
              include: { author: { select: { id: true, name: true, image: true } } },
            },
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    let nextCursor = null;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem?.id ?? null;
    }

    const data = posts.map(post => serializePost(post, userId));

    logger.info({
      event: 'feed_posts_viewed',
      userId,
      count: data.length,
    });

    return NextResponse.json({
      ok: true,
      data: {
        posts: data,
        nextCursor,
      },
    });
  } catch (err) {
    logger.error({
      event: 'feed_posts_get_error',
      error: err.message,
    });

    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      throw new ApiError(401, 'Unauthorized');
    }
    const userId = Number(token.sub);

    const body = await request.json();
    const validated = await validateBody(createPostSchema, body);

    // Sanitize text content
    const text = validated.body ? sanitizeHtml(validated.body.trim()) : null;
    const stage = validated.stage?.toString().trim() || null;
    const industry = validated.industry?.toString().trim() || null;
    const location = validated.location?.toString().trim() || null;
    const linkUrl = validated.linkUrl?.toString().trim() || null;
    const linkTitle = validated.linkTitle ? sanitizeHtml(validated.linkTitle.trim()) : null;
    const linkDescription = validated.linkDescription
      ? sanitizeHtml(validated.linkDescription.trim())
      : null;
    const linkImageUrl = validated.linkImageUrl?.toString().trim() || null;
    const template = validated.template?.toString().trim() || null;
    const templateData = validated.templateData ? JSON.stringify(validated.templateData) : null;
    const professional = Boolean(validated.professional);
    const tagArray = Array.isArray(validated.tags)
      ? validated.tags
      : validated.tags
        ? validated.tags.toString().split(',')
        : [];
    const tags = Array.from(new Set(tagArray.map(normaliseTag))).filter(Boolean);
    const mediaItems = Array.isArray(validated.media) ? validated.media : [];
    const mediaType = mediaItems[0]?.type ?? null;
    const mediaUrl = mediaItems[0]?.url ?? validated.mediaUrl?.toString().trim() ?? null;
    const startupId = validated.startupId ? Number(validated.startupId) : null;

    if (!text && !mediaUrl && !linkUrl) {
      throw new ApiError(400, 'Post content is empty');
    }

    const createData = {
      authorUserId: userId,
      startupId,
      body: text || null,
      embedUrl: body.embedUrl?.toString().trim() || null,
      mediaType,
      mediaUrl,
      linkUrl,
      linkTitle,
      linkDescription,
      linkImageUrl,
      template,
      templateData,
      professional,
      tagList: tags.join(','),
      stage,
      industry,
      location,
      tags: tags.length
        ? {
            createMany: {
              data: tags.map(tag => ({ tag })),
            },
          }
        : undefined,
      media: mediaItems.length
        ? {
            createMany: {
              data: mediaItems.map(item => ({
                type: item.type,
                url: item.url,
                thumbnailUrl: item.thumbnailUrl ?? null,
              })),
            },
          }
        : undefined,
    };

    const created = await prisma.feedPost.create({
      data: createData,
      include: {
        author: { select: { id: true, name: true, image: true } },
        startup: { select: { id: true, name: true } },
        tags: true,
        media: true,
        interactions: {
          where: { type: 'like' },
          select: { userId: true },
        },
        bookmarks: {
          where: { userId },
          select: { userId: true },
        },
        comments: {
          where: { parentCommentId: null },
          orderBy: { createdAt: 'desc' },
          take: COMMENT_PREVIEW_LIMIT,
          include: {
            author: { select: { id: true, name: true, image: true } },
            replies: {
              orderBy: { createdAt: 'asc' },
              include: { author: { select: { id: true, name: true, image: true } } },
            },
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    const serialized = serializePost(created, userId);

    logger.info({
      event: 'feed_post_created',
      userId,
      postId: created.id,
    });

    return NextResponse.json({ ok: true, data: serialized }, { status: 201 });
  } catch (err) {
    logger.error({
      event: 'feed_post_create_error',
      error: err.message,
    });

    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
