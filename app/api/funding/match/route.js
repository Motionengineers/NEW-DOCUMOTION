import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import computeStateMatches from '@/lib/stateMatching';

export const dynamic = 'force-dynamic';

const MAX_LIMIT = 10;
const SAMPLE_SCHEMES = 500;

function parseNumber(value) {
  if (value === undefined || value === null) return null;
  const parsed = Number(String(value).replace(/[,₹\s]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function sanitizeProfile(body = {}) {
  return {
    industry: body.industry?.toString().trim() ?? '',
    stage: body.stage?.toString().trim()?.toLowerCase() ?? 'seed',
    requiredFunding: parseNumber(body.requiredFunding),
    registeredState: body.registeredState?.toString().trim() || '',
    prefersGrant: body.prefersGrant ?? body.preferredBenefit?.toString().toLowerCase() === 'grant',
  };
}

export async function POST(request) {
  try {
    const payload = await request.json().catch(() => ({}));
    const limit = Math.min(Math.max(parseInt(payload.limit ?? '5', 10) || 5, 1), MAX_LIMIT);
    const profile = sanitizeProfile(payload);

    const [states, schemes] = await Promise.all([
      prisma.state.findMany({
        select: {
          id: true,
          name: true,
          abbreviation: true,
          region: true,
          description: true,
        },
      }),
      prisma.stateFundingScheme.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          stateId: true,
          sector: true,
          subSector: true,
          fundingType: true,
          fundingMin: true,
          fundingMax: true,
          interestRate: true,
          subsidyPercent: true,
          verified: true,
          popularityScore: true,
        },
        orderBy: { popularityScore: 'desc' },
        take: SAMPLE_SCHEMES,
      }),
    ]);

    const ranked = computeStateMatches(profile, states, schemes).slice(0, limit);

    console.info(
      JSON.stringify({
        event: 'state_match_generated',
        profile,
        topState: ranked[0]?.stateName ?? null,
        timestamp: Date.now(),
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        profile,
        recommendedState: ranked[0]?.state ?? null,
        recommendations: ranked,
      },
    });
  } catch (error) {
    console.error('POST /api/funding/match failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to compute match score' },
      { status: 500 }
    );
  }
}
