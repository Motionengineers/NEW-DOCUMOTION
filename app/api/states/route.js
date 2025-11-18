import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCachedValue, setCachedValue } from '@/lib/cache';

export const dynamic = 'force-dynamic';

const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_NAMESPACE = 'states';

function getCacheKey(searchParams) {
  return searchParams.toString();
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cacheKey = getCacheKey(searchParams);
  const cached = getCachedValue(CACHE_NAMESPACE, cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const includeCounts = searchParams.get('withCounts') !== 'false';
    const includeSectors = searchParams.get('withSectors') === 'true';
    const regionFilter = searchParams.get('region') || null;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Number.parseInt(limitParam, 10) : null;

    const where = {};
    if (regionFilter) {
      where.region = regionFilter;
    }

    const states = await prisma.state.findMany({
      where,
      orderBy: { name: 'asc' },
      ...(limit ? { take: limit } : {}),
      select: {
        id: true,
        name: true,
        abbreviation: true,
        region: true,
        population: true,
        gdp: true,
        description: true,
        ...(includeCounts ? { _count: { select: { schemes: true } } } : {}),
      },
    });

    let sectorSummary = {};
    if (includeSectors && states.length) {
      const sectorGroups = await prisma.stateFundingScheme.groupBy({
        by: ['stateId', 'sector'],
        where: {
          stateId: { in: states.map(s => s.id) },
          sector: { not: null },
        },
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } },
      });

      sectorSummary = sectorGroups.reduce((acc, group) => {
        const list = acc[group.stateId] ?? [];
        if (group.sector) {
          list.push({ sector: group.sector, count: group._count._all });
        }
        acc[group.stateId] = list;
        return acc;
      }, {});
    }

    const payload = {
      success: true,
      data: states.map(state => ({
        id: state.id,
        name: state.name,
        abbreviation: state.abbreviation,
        region: state.region,
        population: state.population,
        gdp: state.gdp,
        description: state.description,
        schemeCount: includeCounts ? state._count?.schemes ?? 0 : undefined,
        topSectors: includeSectors ? (sectorSummary[state.id] || []).slice(0, 3) : undefined,
      })),
    };

    setCachedValue(CACHE_NAMESPACE, cacheKey, payload, CACHE_TTL_MS);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('GET /api/states failed:', error);
    return NextResponse.json({ success: false, error: 'Unable to load states' }, { status: 500 });
  }
}
