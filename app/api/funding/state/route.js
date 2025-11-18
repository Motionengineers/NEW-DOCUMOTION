import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCachedValue, setCachedValue } from '@/lib/cache';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const CACHE_TTL_MS = 60 * 1000;
const CACHE_NAMESPACE = 'funding-state';

const ORDER_BY_MAP = {
  recent: { lastUpdated: 'desc' },
  'interest-low': { interestRate: 'asc' },
  'interest-high': { interestRate: 'desc' },
  'funding-high': { fundingMax: 'desc' },
  'funding-low': { fundingMax: 'asc' },
  popularity: { popularityScore: 'desc' },
};

function parseNumberParam(value) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBooleanParam(value) {
  if (value === null) return null;
  if (value === undefined) return null;
  return ['true', '1', 'yes'].includes(String(value).toLowerCase());
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cacheKey = searchParams.toString();
  const cached = getCachedValue(CACHE_NAMESPACE, cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const stateParam = searchParams.get('state');
    const sectorParam = searchParams.get('sector');
    const fundingTypeParam = searchParams.get('fundingType');
    const centralParam = searchParams.get('source');
    const verifiedParam = parseBooleanParam(searchParams.get('verified'));
    const tagParam = searchParams.get('tag');
    const q = searchParams.get('q');
    const sort = searchParams.get('sort') ?? 'recent';
    const limitParam = Number.parseInt(searchParams.get('limit') ?? '', 10);
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), MAX_LIMIT)
      : DEFAULT_LIMIT;
    const cursorParam = searchParams.get('cursor');
    const fundingMin = parseNumberParam(searchParams.get('fundingMin'));
    const fundingMax = parseNumberParam(searchParams.get('fundingMax'));

    const where = {};

    if (stateParam) {
      // SQLite doesn't support mode: 'insensitive', so we normalize the input
      const normalizedState = stateParam.trim();
      where.state = {
        OR: [
          { name: { equals: normalizedState } },
          { abbreviation: { equals: normalizedState } },
        ],
      };
    }

    if (sectorParam) {
      where.sector = { contains: sectorParam };
    }

    if (fundingTypeParam) {
      where.fundingType = { equals: fundingTypeParam };
    }

    if (centralParam) {
      where.centralOrState = {
        equals: centralParam.charAt(0).toUpperCase() + centralParam.slice(1).toLowerCase(),
      };
    }

    if (verifiedParam !== null) {
      where.verified = verifiedParam;
    }

    if (tagParam) {
      // SQLite doesn't support mode: 'insensitive'
      where.tags = { contains: tagParam };
    }

    if (q) {
      // SQLite doesn't support mode: 'insensitive'
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { sector: { contains: q } },
        { subSector: { contains: q } },
        { eligibility: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    if (fundingMin !== null || fundingMax !== null) {
      where.AND = where.AND || [];
      if (fundingMin !== null) {
        where.AND.push({
          OR: [
            { fundingMin: null },
            { fundingMin: { lte: fundingMin } },
            { fundingMax: { gte: fundingMin } },
          ],
        });
      }
      if (fundingMax !== null) {
        where.AND.push({
          OR: [
            { fundingMax: null },
            { fundingMax: { gte: fundingMax } },
            { fundingMin: { lte: fundingMax } },
          ],
        });
      }
    }

    const orderBy = ORDER_BY_MAP[sort] ?? ORDER_BY_MAP.recent;

    const queryOptions = {
      where,
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
      orderBy,
      take: limit + 1,
    };

    if (cursorParam) {
      queryOptions.cursor = { id: Number(cursorParam) };
      queryOptions.skip = 1;
    }

    let schemes = await prisma.stateFundingScheme.findMany(queryOptions);

    let nextCursor = null;
    if (schemes.length > limit) {
      const nextItem = schemes.pop();
      nextCursor = nextItem?.id ?? null;
    }

    const payload = {
      success: true,
      data: {
        schemes: schemes.map(scheme => ({
          id: scheme.id,
          title: scheme.title,
          description: scheme.description,
          fundingAmount: scheme.fundingAmount,
          fundingMin: scheme.fundingMin,
          fundingMax: scheme.fundingMax,
          fundingType: scheme.fundingType,
          centralOrState: scheme.centralOrState,
          interestRate: scheme.interestRate,
          subsidyPercent: scheme.subsidyPercent,
          sector: scheme.sector,
          subSector: scheme.subSector,
          eligibility: scheme.eligibility,
          applyLink: scheme.applyLink,
          officialLink: scheme.officialLink,
          lastUpdated: scheme.lastUpdated,
          status: scheme.status,
          verified: scheme.verified,
          popularityScore: scheme.popularityScore,
          tags: scheme.tags,
          state: scheme.state,
        })),
        nextCursor,
      },
    };

    setCachedValue(CACHE_NAMESPACE, cacheKey, payload, CACHE_TTL_MS);

    return NextResponse.json(payload);
  } catch (error) {
    console.error('GET /api/funding/state failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load funding schemes' },
      { status: 500 }
    );
  }
}
