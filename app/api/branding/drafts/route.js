import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const drafts = await prisma.brandDraft.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json({ success: true, drafts });
  } catch (error) {
    console.error('GET /api/branding/drafts error:', error);
    return NextResponse.json({ success: false, error: 'Unable to load drafts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const id = body.id || null;
    const dataJson = JSON.stringify(body.data || {});
    if (id) {
      const updated = await prisma.brandDraft.update({
        where: { id: Number(id) },
        data: { dataJson, status: body.status || undefined },
      });
      return NextResponse.json({ success: true, draft: updated });
    }
    const created = await prisma.brandDraft.create({
      data: {
        startupId: body.startupId || null,
        authorId: body.authorId || null,
        dataJson,
        status: body.status || 'draft',
      },
    });
    return NextResponse.json({ success: true, draft: created });
  } catch (error) {
    console.error('POST /api/branding/drafts error:', error);
    return NextResponse.json({ success: false, error: 'Unable to save draft' }, { status: 500 });
  }
}


