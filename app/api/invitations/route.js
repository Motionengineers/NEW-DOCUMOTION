import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agencyIdParam = searchParams.get('agencyId');
    const agencyId = agencyIdParam ? Number(agencyIdParam) : null;

    if (!agencyId || Number.isNaN(agencyId)) {
      return NextResponse.json({ error: 'agencyId is required' }, { status: 400 });
    }

    const [members, invites] = await Promise.all([
      prisma.user.findMany({
        where: { agencyId },
        select: {
          id: true,
          name: true,
          email: true,
          teamRole: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          image: true,
        },
        orderBy: [{ teamRole: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.teamInvitation.findMany({
        where: { agencyId, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          expiresAt: true,
          status: true,
        },
      }),
    ]);

    return NextResponse.json({
      status: 'ok',
      members,
      invites,
    });
  } catch (error) {
    console.error('GET /api/invitations failed:', error);
    return NextResponse.json({ error: 'Failed to load invitations' }, { status: 500 });
  }
}

