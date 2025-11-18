import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  try {
    const draftId = Number(params.id);
    const comments = await prisma.brandComment.findMany({
      where: { draftId },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error('GET /api/branding/drafts/[id]/comments error:', error);
    return NextResponse.json({ success: false, error: 'Unable to load comments' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const draftId = Number(params.id);
    const body = await request.json();
    const created = await prisma.brandComment.create({
      data: {
        draftId,
        authorId: body.authorId || null,
        text: body.text || '',
      },
    });
    return NextResponse.json({ success: true, comment: created });
  } catch (error) {
    console.error('POST /api/branding/drafts/[id]/comments error:', error);
    return NextResponse.json({ success: false, error: 'Unable to add comment' }, { status: 500 });
  }
}


