import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const job = await prisma.brandExportJob.create({
      data: {
        startupId: body.startupId || null,
        versionId: body.versionId || null,
        status: 'completed',
        filesJson: JSON.stringify([
          { path: 'logos/logo-default.svg' },
          { path: 'palette.json' },
          { path: 'brand.pdf' },
        ]),
        url: `/downloads/brand-kit-${Date.now()}.zip`,
      },
    });
    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error('POST /api/branding/kit/export error:', error);
    return NextResponse.json({ success: false, error: 'Unable to start export' }, { status: 500 });
  }
}


