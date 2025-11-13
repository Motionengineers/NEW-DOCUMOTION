import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { normaliseTag, serializePost } from '@/lib/feed/serializers';

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
    if (q) {
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

    return NextResponse.json({
      success: true,
      data: {
        posts: data,
        nextCursor,
      },
    });
  } catch (error) {
    console.error('GET /api/feed/posts failed:', error);
    return NextResponse.json({ success: false, error: 'Unable to load feed' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = Number(token.sub);

    const body = await request.json();
    const text = body.body?.toString().trim();
    const stage = body.stage?.toString().trim() || null;
    const industry = body.industry?.toString().trim() || null;
    const location = body.location?.toString().trim() || null;
    const linkUrl = body.linkUrl?.toString().trim() || null;
    const linkTitle = body.linkTitle?.toString().trim() || null;
    const linkDescription = body.linkDescription?.toString().trim() || null;
    const professional = Boolean(body.professional);
    const tagArray = Array.isArray(body.tags)
      ? body.tags
      : body.tags
        ? body.tags.toString().split(',')
        : [];
    const tags = Array.from(new Set(tagArray.map(normaliseTag))).filter(Boolean);
    const mediaItems = Array.isArray(body.media) ? body.media : [];
    const mediaType = mediaItems[0]?.type ?? null;
    const mediaUrl = mediaItems[0]?.url ?? body.mediaUrl?.toString().trim() ?? null;
    const startupId = body.startupId ? Number(body.startupId) : null;

    if (!text && !mediaUrl && !linkUrl) {
      return NextResponse.json({ success: false, error: 'Post content is empty' }, { status: 400 });
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

    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error('POST /api/feed/posts failed:', error);
    return NextResponse.json({ success: false, error: 'Unable to create post' }, { status: 500 });
  }
}
