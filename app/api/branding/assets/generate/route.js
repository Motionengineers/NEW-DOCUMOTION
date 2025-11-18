import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Placeholder asset generator. In production, hook an AI service + S3 upload here.
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const startupId = body.startupId || null;
    const versionId = body.versionId || null;

    const now = Date.now();
    const assets = [
      { kind: 'logo', variant: 'default', url: `/placeholders/logo-${now}.svg`, format: 'svg' },
      { kind: 'favicon', variant: 'default', url: `/placeholders/favicon-${now}.ico`, format: 'ico' },
      { kind: 'app_icon', variant: '192', url: `/placeholders/icon-${now}-192.png`, format: 'png', width: 192, height: 192 },
      { kind: 'social_banner', variant: 'twitter', url: `/placeholders/twitter-${now}.png`, format: 'png', width: 1500, height: 500 },
    ];

    const created = await prisma.$transaction(
      assets.map(a =>
        prisma.brandAsset.create({
          data: {
            startupId,
            versionId,
            kind: a.kind,
            variant: a.variant || null,
            url: a.url,
            width: a.width || null,
            height: a.height || null,
            format: a.format || null,
          },
        })
      )
    );

    return NextResponse.json({ success: true, assets: created });
  } catch (error) {
    console.error('POST /api/branding/assets/generate error:', error);
    return NextResponse.json({ success: false, error: 'Unable to generate assets' }, { status: 500 });
  }
}


