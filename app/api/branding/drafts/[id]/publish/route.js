import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(_request, { params }) {
  try {
    const id = Number(params.id);
    const draft = await prisma.brandDraft.findUnique({ where: { id } });
    if (!draft) {
      return NextResponse.json({ success: false, error: 'Draft not found' }, { status: 404 });
    }
    if (draft.status !== 'approved') {
      return NextResponse.json({ success: false, error: 'Draft is not approved' }, { status: 400 });
    }
    const versionCode = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 12);
    const version = await prisma.brandVersion.create({
      data: {
        startupId: draft.startupId,
        version: versionCode,
        dataJson: draft.dataJson,
      },
    });
    return NextResponse.json({ success: true, version });
  } catch (error) {
    console.error('POST /api/branding/drafts/[id]/publish error:', error);
    return NextResponse.json({ success: false, error: 'Unable to publish' }, { status: 500 });
  }
}


