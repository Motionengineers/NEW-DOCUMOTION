import prisma from '@/lib/prisma';
import {
  normalizeRole,
  createInviteToken,
  calcExpiryDate,
  sendInviteEmail,
  recordActivity,
} from '@/lib/invitations';

const APP_URL = process.env.APP_URL || process.env.NEXTAUTH_URL;

if (!APP_URL) {
  throw new Error('APP_URL or NEXTAUTH_URL must be configured for invitation emails.');
}

export async function createTeamInvitation({
  agencyId: rawAgencyId,
  email: rawEmail,
  name,
  role,
  createdById,
  managerEmail,
  message,
  inviterName,
  agencyName: providedAgencyName,
  source = 'manual',
  attachExistingUser = true,
}) {
  const agencyId = Number(rawAgencyId);
  const email = (rawEmail || '').toLowerCase().trim();
  const normalizedRole = normalizeRole(role);

  if (!agencyId || Number.isNaN(agencyId)) {
    return { outcome: 'error', status: 400, message: 'Invalid agencyId' };
  }

  if (!email) {
    return { outcome: 'error', status: 400, message: 'Email is required' };
  }

  const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
  if (!agency) {
    return { outcome: 'error', status: 404, message: 'Agency not found' };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser && existingUser.agencyId === agencyId) {
    return { outcome: 'already_member', payload: { userId: existingUser.id } };
  }

  if (existingUser && attachExistingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        agencyId,
        teamRole: normalizedRole,
        status: 'ACTIVE',
      },
    });

    await recordActivity({
      agencyId,
      message: `${existingUser.email} joined the workspace (existing Documotion account).`,
    });

    return {
      outcome: 'existing_user_attached',
      payload: { userId: existingUser.id },
    };
  }

  const pendingInvite = await prisma.teamInvitation.findFirst({
    where: {
      email,
      agencyId,
      status: 'PENDING',
    },
    select: {
      id: true,
      expiresAt: true,
    },
  });

  if (pendingInvite) {
    return {
      outcome: 'pending_exists',
      payload: { inviteId: pendingInvite.id, expiresAt: pendingInvite.expiresAt },
    };
  }

  let creatorId = createdById ? Number(createdById) : null;
  if (!creatorId || Number.isNaN(creatorId)) {
    const owner = await prisma.user.findFirst({
      where: { agencyId, teamRole: { in: ['OWNER', 'ADMIN'] } },
      select: { id: true },
    });
    creatorId = owner?.id ?? null;
  }

  if (!creatorId) {
    return {
      outcome: 'error',
      status: 400,
      message:
        'No owner/admin found for agency. Provide createdById or assign a team owner before inviting.',
    };
  }

  const { token, tokenHash } = createInviteToken();
  const invite = await prisma.teamInvitation.create({
    data: {
      email,
      name,
      role: normalizedRole,
      agencyId,
      token,
      tokenHash,
      createdById: creatorId,
      expiresAt: calcExpiryDate(),
      metadata: JSON.stringify({
        managerEmail: managerEmail ?? null,
        message: message ?? null,
        inviteSource: source,
        inviterName: inviterName ?? null,
      }),
    },
  });

  const acceptUrl = `${APP_URL.replace(/\/$/, '')}/invite/${token}`;
  await sendInviteEmail({
    to: email,
    inviteeName: name,
    inviterName: inviterName ?? undefined,
    agencyName: providedAgencyName ?? agency.name,
    role: normalizedRole,
    acceptUrl,
  });

  await recordActivity({
    agencyId,
    message: `${email} invited to workspace.`,
  });

  return {
    outcome: 'created',
    payload: {
      inviteId: invite.id,
      expiresAt: invite.expiresAt,
    },
  };
}
