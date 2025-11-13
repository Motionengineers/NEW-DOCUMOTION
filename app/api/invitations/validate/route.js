import crypto from 'crypto';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function GET(request) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const invite = await prisma.teamInvitation.findUnique({
      where: { tokenHash: hashToken(token) },
      include: {
        agency: { select: { id: true, name: true } },
      },
    });

    if (!invite) {
      return NextResponse.json({ status: 'invalid' }, { status: 404 });
    }

    if (invite.status !== 'PENDING' || new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ status: 'expired' }, { status: 410 });
    }

    return NextResponse.json({
      status: 'valid',
      invite: {
        id: invite.id,
        email: invite.email,
        name: invite.name,
        role: invite.role,
        agency: invite.agency,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    console.error('GET /api/invitations/validate failed:', error);
    return NextResponse.json({ error: 'Failed to validate token' }, { status: 500 });
  }
}
