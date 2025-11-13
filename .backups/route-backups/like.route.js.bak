// Build-safe guard: mark dynamic and avoid crashing at build-time
export const dynamic = "force-dynamic";

let prisma = null;
try {
  // require at runtime; during build this may fail if @prisma/client wasn't generated
  const { PrismaClient } = require("@prisma/client");
  prisma = new PrismaClient();
} catch (e) {
  // log to build output but do not throw — keeps Vercel build from failing
  // eslint-disable-next-line no-console
  console.warn("⚠️ Prisma client not available during build:", e && e.message ? e.message : e);
  prisma = null;
}
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
    const action = payload?.action === 'unlike' ? 'unlike' : 'like';

    if (action === 'unlike') {
      await prisma.feedInteraction.deleteMany({
        where: {
          postId,
          userId,
          type: 'like',
        },
      });
      return NextResponse.json({ success: true, data: { liked: false } });
    }

    await prisma.feedInteraction.upsert({
      where: {
        postId_userId_type: {
          postId,
          userId,
          type: 'like',
        },
      },
      create: {
        postId,
        userId,
        type: 'like',
      },
      update: {},
    });

    return NextResponse.json({ success: true, data: { liked: true } });
  } catch (error) {
    console.error('POST /api/feed/posts/[postId]/like failed:', error);
    return NextResponse.json({ success: false, error: 'Unable to update like' }, { status: 500 });
  }
}
