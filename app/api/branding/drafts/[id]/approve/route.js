import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const id = Number(params.id);
    const body = await request.json().catch(() => ({}));
    const approverId = body.approverId || null;
    const note = body.note || null;
    await prisma.$transaction(async tx => {
      await tx.brandApproval.create({
        data: { draftId: id, approverId, status: 'approved', note },
      });
      await tx.brandDraft.update({
        where: { id },
        data: { status: 'approved' },
      });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/branding/drafts/[id]/approve error:', error);
    return NextResponse.json({ success: false, error: 'Unable to approve draft' }, { status: 500 });
  }
}


