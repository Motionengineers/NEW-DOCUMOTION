import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

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
    const postId = Number(params.postId);
    if (Number.isNaN(postId)) {
      return NextResponse.json({ success: false, error: 'Invalid post id' }, { status: 400 });
    }

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
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = Number(token.sub);
    const postId = Number(params.postId);

    if (Number.isNaN(postId)) {
      return NextResponse.json({ success: false, error: 'Invalid post id' }, { status: 400 });
    }

    const body = await request.json();
    const text = body.body?.toString().trim();
    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Comment cannot be empty' },
        { status: 400 }
      );
    }

    const parentCommentId = body.parentCommentId ? Number(body.parentCommentId) : null;

    const created = await prisma.feedComment.create({
      data: {
        postId,
        authorUserId: userId,
        body: text,
        parentCommentId,
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

    return NextResponse.json({ success: true, data: serializeComment(created) });
  } catch (error) {
    console.error('POST /api/feed/posts/[postId]/comments failed:', error);
    return NextResponse.json({ success: false, error: 'Unable to add comment' }, { status: 500 });
  }
}
