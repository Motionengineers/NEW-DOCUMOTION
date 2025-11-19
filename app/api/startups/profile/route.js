import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UpdateStartupSchema } from '@/lib/schemas/startup-schema';
import { validateBody } from '@/lib/api-validation';
import { ApiError } from '@/lib/api-error';
import prisma from '@/lib/prisma';
import { normaliseStartupProfileForMatching } from '@/lib/bankMatching';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateSchema = UpdateStartupSchema.extend({
  servicesNeeded: z.array(z.string().min(1)).optional(),
  specialCriteria: z.array(z.string().min(1)).optional(),
  preferredBankTypes: z.array(z.string().min(1)).optional(),
});

function requireAuth(token) {
  if (!token?.sub) {
    return null;
  }
  return Number(token.sub);
}

function splitList(value) {
  if (!value) return [];
  return value
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean);
}

function serialiseList(list) {
  if (!list) return null;
  if (Array.isArray(list)) {
    return list
      .map(entry => entry.trim())
      .filter(Boolean)
      .join(',');
  }
  return String(list);
}

function shapeStartupPayload(startup) {
  if (!startup) return null;
  const normalised = normaliseStartupProfileForMatching(startup);
  return {
    id: startup.id,
    stage: startup.stage || null,
    sector: startup.sector || null,
    revenue: startup.revenue ?? null,
    revenueBand: startup.revenueBand || normalised?.revenueBand?.label || null,
    location: startup.location || null,
    servicesNeeded: splitList(startup.servicesNeeded),
    specialCriteria: splitList(startup.specialCriteria),
    preferredBankTypes: splitList(startup.preferredBankTypes),
    preferredLoanMin: startup.preferredLoanMin ?? null,
    preferredLoanMax: startup.preferredLoanMax ?? null,
  };
}

export async function GET(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = requireAuth(token);
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    const startup = await prisma.startup.findFirst({
      where: { userId },
      select: {
        id: true,
        stage: true,
        sector: true,
        revenue: true,
        revenueBand: true,
        location: true,
        servicesNeeded: true,
        specialCriteria: true,
        preferredBankTypes: true,
        preferredLoanMin: true,
        preferredLoanMax: true,
      },
    });

    if (!startup) {
      throw new ApiError(404, 'Startup not found');
    }

    logger.info({
      event: 'startup_profile_viewed',
      userId,
      startupId: startup.id,
    });

    return NextResponse.json({ ok: true, data: shapeStartupPayload(startup) });
  } catch (err) {
    logger.error({
      event: 'startup_profile_get_error',
      error: err.message,
    });

    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = requireAuth(token);
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    const startup = await prisma.startup.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (!startup) {
      throw new ApiError(404, 'Startup not found');
    }

    const json = await request.json();
    const payload = await validateBody(updateSchema, json);

    const data = {
      stage: payload.stage ?? undefined,
      sector: payload.sector ?? undefined,
      revenue: payload.revenue ?? undefined,
      revenueBand: payload.revenueBand ?? undefined,
      location: payload.location ?? undefined,
      servicesNeeded: payload.servicesNeeded ? serialiseList(payload.servicesNeeded) : undefined,
      specialCriteria: payload.specialCriteria ? serialiseList(payload.specialCriteria) : undefined,
      preferredBankTypes: payload.preferredBankTypes
        ? serialiseList(payload.preferredBankTypes)
        : undefined,
      preferredLoanMin: payload.preferredLoanMin ?? undefined,
      preferredLoanMax: payload.preferredLoanMax ?? undefined,
    };

    const updated = await prisma.startup.update({
      where: { id: startup.id },
      data,
      select: {
        id: true,
        stage: true,
        sector: true,
        revenue: true,
        revenueBand: true,
        location: true,
        servicesNeeded: true,
        specialCriteria: true,
        preferredBankTypes: true,
        preferredLoanMin: true,
        preferredLoanMax: true,
      },
    });

    logger.info({
      event: 'startup_profile_updated',
      userId,
      startupId: startup.id,
    });

    return NextResponse.json({ ok: true, data: shapeStartupPayload(updated) });
  } catch (err) {
    logger.error({
      event: 'startup_profile_update_error',
      error: err.message,
    });

    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
