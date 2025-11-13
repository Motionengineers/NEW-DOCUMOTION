import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

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

    const payload = await request.json().catch(() => ({}));
    const action = payload?.action === 'remove' ? 'remove' : 'add';

    if (action === 'remove') {
      await prisma.feedBookmark.deleteMany({
        where: {
          postId,
          userId,
        },
      });
      return NextResponse.json({ success: true, data: { bookmarked: false } });
    }

    await prisma.feedBookmark.upsert({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
      create: {
        userId,
        postId,
      },
      update: {},
    });

    return NextResponse.json({ success: true, data: { bookmarked: true } });
  } catch (error) {
    console.error('POST /api/feed/posts/[postId]/bookmark failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to update bookmark' },
      { status: 500 }
    );
  }
}
