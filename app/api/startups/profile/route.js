import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { normaliseStartupProfileForMatching } from '@/lib/bankMatching';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  stage: z.string().max(120).nullable().optional(),
  sector: z.string().max(240).nullable().optional(),
  revenue: z.number().nonnegative().nullable().optional(),
  revenueBand: z.string().max(50).nullable().optional(),
  location: z.string().max(240).nullable().optional(),
  servicesNeeded: z.array(z.string().min(1)).optional(),
  specialCriteria: z.array(z.string().min(1)).optional(),
  preferredBankTypes: z.array(z.string().min(1)).optional(),
  preferredLoanMin: z.number().nonnegative().nullable().optional(),
  preferredLoanMax: z.number().nonnegative().nullable().optional(),
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
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ success: false, error: 'Startup not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: shapeStartupPayload(startup) });
  } catch (error) {
    console.error('GET /api/startups/profile failed:', error);
    return NextResponse.json({ success: false, error: 'Unable to load profile' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = requireAuth(token);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const startup = await prisma.startup.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (!startup) {
      return NextResponse.json({ success: false, error: 'Startup not found' }, { status: 404 });
    }

    const json = await request.json();
    const payload = updateSchema.parse(json);

    const data = {
      stage: payload.stage ?? undefined,
      sector: payload.sector ?? undefined,
      revenue: payload.revenue ?? undefined,
      revenueBand: payload.revenueBand ?? undefined,
      location: payload.location ?? undefined,
      servicesNeeded: payload.servicesNeeded ? serialiseList(payload.servicesNeeded) : undefined,
      specialCriteria: payload.specialCriteria ? serialiseList(payload.specialCriteria) : undefined,
      preferredBankTypes: payload.preferredBankTypes ? serialiseList(payload.preferredBankTypes) : undefined,
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

    return NextResponse.json({ success: true, data: shapeStartupPayload(updated) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid payload', details: error.flatten() }, { status: 422 });
    }
    console.error('PATCH /api/startups/profile failed:', error);
    return NextResponse.json({ success: false, error: 'Unable to update profile' }, { status: 500 });
  }
}

