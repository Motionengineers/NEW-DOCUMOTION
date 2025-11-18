import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startupId = searchParams.get('startupId');
    const versionId = searchParams.get('versionId');
    const kind = searchParams.get('kind');
    const where = {
      ...(startupId ? { startupId: Number(startupId) } : {}),
      ...(versionId ? { versionId: Number(versionId) } : {}),
      ...(kind ? { kind } : {}),
    };
    const assets = await prisma.brandAsset.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { id: 'desc' },
    });
    return NextResponse.json({ success: true, assets });
  } catch (error) {
    console.error('GET /api/branding/assets error:', error);
    return NextResponse.json({ success: false, error: 'Unable to list assets' }, { status: 500 });
  }
}


