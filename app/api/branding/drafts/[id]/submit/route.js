import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(_request, { params }) {
  try {
    const id = Number(params.id);
    const updated = await prisma.brandDraft.update({
      where: { id },
      data: { status: 'review' },
    });
    return NextResponse.json({ success: true, draft: updated });
  } catch (error) {
    console.error('POST /api/branding/drafts/[id]/submit error:', error);
    return NextResponse.json({ success: false, error: 'Unable to submit draft' }, { status: 500 });
  }
}


