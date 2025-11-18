import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  try {
    const id = Number(params.id);
    const draft = await prisma.brandDraft.findUnique({
      where: { id },
      include: {
        comments: true,
        approvals: true,
      },
    });
    if (!draft) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, draft });
  } catch (error) {
    console.error('GET /api/branding/drafts/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Unable to load draft' }, { status: 500 });
  }
}


