import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { recordActivity } from '@/lib/invitations';

const SALT_ROUNDS = 10;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const token = body.token?.trim();
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const invite = await prisma.teamInvitation.findUnique({
      where: { tokenHash: hashToken(token) },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    if (invite.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invitation already processed' }, { status: 400 });
    }

    if (new Date(invite.expiresAt) < new Date()) {
      await prisma.teamInvitation.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json({ error: 'Invitation expired' }, { status: 410 });
    }

    const password = body.password?.trim();
    const name = body.name?.trim() || invite.name || null;

    let user = await prisma.user.findUnique({ where: { email: invite.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: invite.email,
          name,
          passwordHash: password ? await bcrypt.hash(password, SALT_ROUNDS) : null,
          teamRole: invite.role,
          status: 'ACTIVE',
          agencyId: invite.agencyId,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name ?? user.name,
          agencyId: invite.agencyId,
          teamRole: invite.role,
          status: 'ACTIVE',
          ...(password ? { passwordHash: await bcrypt.hash(password, SALT_ROUNDS) } : {}),
        },
      });
    }

    await prisma.teamInvitation.update({
      where: { id: invite.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
        acceptedById: user.id,
      },
    });

    await recordActivity({
      agencyId: invite.agencyId,
      message: `${invite.email} accepted their workspace invitation.`,
    });

    return NextResponse.json({ status: 'accepted', userId: user.id });
  } catch (error) {
    console.error('POST /api/invitations/accept failed:', error);
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 });
  }
}
