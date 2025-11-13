import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimitFromRequest } from '@/lib/rate-limit';
import { recordActivity } from '@/lib/invitations';

export async function POST(request) {
  try {
    if (!rateLimitFromRequest(request, 60, 60_000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const inviteId = Number(body.inviteId);
    if (!inviteId || Number.isNaN(inviteId)) {
      return NextResponse.json({ error: 'inviteId is required' }, { status: 400 });
    }

    const invite = await prisma.teamInvitation.findUnique({
      where: { id: inviteId },
      select: { id: true, agencyId: true, status: true, email: true },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invite.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending invites can be revoked' }, { status: 400 });
    }

    await prisma.teamInvitation.update({
      where: { id: invite.id },
      data: {
        status: 'REVOKED',
        expiresAt: new Date(),
      },
    });

    await recordActivity({
      agencyId: invite.agencyId,
      message: `Invitation revoked for ${invite.email}`,
    });

    return NextResponse.json({ status: 'revoked', inviteId: invite.id });
  } catch (error) {
    console.error('POST /api/invitations/revoke failed:', error);
    return NextResponse.json({ error: 'Failed to revoke invitation' }, { status: 500 });
  }
}
