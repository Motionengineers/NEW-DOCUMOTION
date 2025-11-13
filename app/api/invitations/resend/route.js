import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  createInviteToken,
  calcExpiryDate,
  sendInviteEmail,
  recordActivity,
} from '@/lib/invitations';
import { rateLimitFromRequest } from '@/lib/rate-limit';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

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
      include: { agency: true, createdBy: true },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invite.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invitation is not pending' }, { status: 400 });
    }

    const { token, tokenHash } = createInviteToken();
    const expiresAt = calcExpiryDate();

    await prisma.teamInvitation.update({
      where: { id: invite.id },
      data: {
        token,
        tokenHash,
        expiresAt,
        createdAt: new Date(),
      },
    });

    const acceptUrl = `${APP_URL.replace(/\/$/, '')}/invite/${token}`;
    await sendInviteEmail({
      to: invite.email,
      inviteeName: invite.name,
      inviterName: invite.createdBy?.name ?? invite.createdBy?.email ?? 'Your team',
      agencyName: invite.agency?.name,
      role: invite.role,
      acceptUrl,
    });

    await recordActivity({
      agencyId: invite.agencyId,
      message: `Invitation resent to ${invite.email}`,
    });

    return NextResponse.json({ status: 'resent', inviteId: invite.id, expiresAt });
  } catch (error) {
    console.error('POST /api/invitations/resend failed:', error);
    return NextResponse.json({ error: 'Failed to resend invitation' }, { status: 500 });
  }
}

