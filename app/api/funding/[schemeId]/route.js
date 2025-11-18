import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  try {
    const schemeId = Number(params.schemeId);
    if (!Number.isFinite(schemeId)) {
      return NextResponse.json({ success: false, error: 'Invalid scheme id' }, { status: 400 });
    }

    const scheme = await prisma.stateFundingScheme.findUnique({
      where: { id: schemeId },
      include: {
        state: {
          select: {
            id: true,
            name: true,
            abbreviation: true,
            region: true,
          },
        },
      },
    });

    if (!scheme) {
      return NextResponse.json({ success: false, error: 'Scheme not found' }, { status: 404 });
    }

    const similarSchemes = await prisma.stateFundingScheme.findMany({
      where: {
        id: { not: scheme.id },
        stateId: scheme.stateId,
        fundingType: scheme.fundingType,
      },
      select: {
        id: true,
        title: true,
        fundingType: true,
        fundingMax: true,
        fundingAmount: true,
      },
      orderBy: { popularityScore: 'desc' },
      take: 3,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: scheme.id,
        title: scheme.title,
        description: scheme.description,
        fundingAmount: scheme.fundingAmount,
        fundingMin: scheme.fundingMin,
        fundingMax: scheme.fundingMax,
        fundingType: scheme.fundingType,
        centralOrState: scheme.centralOrState,
        sector: scheme.sector,
        subSector: scheme.subSector,
        interestRate: scheme.interestRate,
        subsidyPercent: scheme.subsidyPercent,
        eligibility: scheme.eligibility,
        eligibilityJson: safeJsonParse(scheme.eligibilityJson),
        applyLink: scheme.applyLink,
        officialLink: scheme.officialLink,
        verified: scheme.verified,
        status: scheme.status,
        popularityScore: scheme.popularityScore,
        tags: scheme.tags,
        state: scheme.state,
        similar: similarSchemes,
      },
    });
  } catch (error) {
    console.error('GET /api/funding/[id] failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load scheme detail' },
      { status: 500 }
    );
  }
}

function safeJsonParse(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}


