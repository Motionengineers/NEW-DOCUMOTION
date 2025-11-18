import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startupId = searchParams.get('startupId');
    const roles = await prisma.brandRole.findMany({
      where: startupId ? { startupId: Number(startupId) } : undefined,
    });
    return NextResponse.json({ success: true, roles });
  } catch (error) {
    console.error('GET /api/branding/roles error:', error);
    return NextResponse.json({ success: false, error: 'Unable to load roles' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const role = await prisma.brandRole.upsert({
      where: {
        startupId_userId: { startupId: Number(body.startupId), userId: Number(body.userId) },
      },
      update: { role: body.role },
      create: {
        startupId: Number(body.startupId),
        userId: Number(body.userId),
        role: body.role || 'designer',
      },
    });
    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error('POST /api/branding/roles error:', error);
    return NextResponse.json({ success: false, error: 'Unable to upsert role' }, { status: 500 });
  }
}


