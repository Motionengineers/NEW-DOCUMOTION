import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { matchBankPrograms, normaliseStartupProfileForMatching, normaliseProfile as normaliseInlineProfile } from '@/lib/bankMatching';

export const dynamic = 'force-dynamic';

async function loadStartupProfileForUser(userId) {
  if (!userId) return null;
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
  if (!startup) return null;
  return { ...normaliseStartupProfileForMatching(startup), startupId: startup.id };
}

function mergeProfiles(base = {}, overrides = {}) {
  const merged = { ...base };
  Object.entries(overrides).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    merged[key] = value;
  });
  return merged;
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.sub ? Number(token.sub) : null;

    let profile = {};
    let startupId = null;

    if (payload.startupId) {
      const startup = await prisma.startup.findUnique({
        where: { id: Number(payload.startupId) },
        select: {
          id: true,
          userId: true,
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
      if (userId && startup.userId !== userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      startupId = startup.id;
      profile = normaliseStartupProfileForMatching(startup);
    } else if (userId) {
      const startupProfile = await loadStartupProfileForUser(userId);
      if (startupProfile) {
        startupId = startupProfile.startupId;
        profile = startupProfile;
      }
    }

    const overrideProfile = normaliseInlineProfile(payload.profile || payload);
    const mergedProfile = mergeProfiles(profile, overrideProfile);

    const filters = payload.filters || {};
    const matches = await matchBankPrograms(mergedProfile, { limit: payload.limit, filters });

    return NextResponse.json({ success: true, startupId, ...matches });
  } catch (error) {
    console.error('POST /api/banks/match failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to generate bank matches' },
      { status: 500 }
    );
  }
}

