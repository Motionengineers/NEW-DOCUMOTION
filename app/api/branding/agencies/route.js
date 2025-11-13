import { NextResponse } from 'next/server';
import { listAgencies, listAgencyFilters } from '@/lib/brandingHub';

export const dynamic = 'force-dynamic';

function parseInteger(value, fallback) {
  if (value === null || value === undefined) return fallback;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseFloatValue(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number.parseFloat(String(value));
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseMultiValue(searchParams, key) {
  const values = searchParams.getAll(key);
  if (values.length > 1) {
    return values.filter(Boolean);
  }
  const single = searchParams.get(key);
  if (!single) return [];
  if (single.includes(',')) {
    return single
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);
  }
  return [single];
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const { searchParams } = url;

    const page = Math.max(parseInteger(searchParams.get('page'), 1), 1);
    const limit = Math.min(Math.max(parseInteger(searchParams.get('limit'), 24), 1), 100);
    const skip = (page - 1) * limit;

    const filters = {
      city: parseMultiValue(searchParams, 'city'),
      state: parseMultiValue(searchParams, 'state'),
      services: parseMultiValue(searchParams, 'service'),
      categories: parseMultiValue(searchParams, 'category'),
      verified: searchParams.has('verified')
        ? searchParams.get('verified') === 'true'
        : undefined,
      minRating: parseFloatValue(searchParams.get('minRating'), undefined),
      minBudget: parseInteger(searchParams.get('minBudget'), undefined),
      maxBudget: parseInteger(searchParams.get('maxBudget'), undefined),
      teamSizeBands: parseMultiValue(searchParams, 'teamSize'),
    };

    const includeServices = searchParams.get('includeServices') === 'true';
    const includePortfolio = searchParams.get('includePortfolio') === 'true';
    const includeFilters = searchParams.get('withFilters') === 'true';

    const { agencies, total } = await listAgencies({
      take: limit,
      skip,
      filters,
      includeServices,
      includePortfolio,
    });

    const totalPages = Math.ceil(total / limit);

    const responsePayload = {
      success: true,
      data: agencies,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      filters: {
        applied: filters,
      },
    };

    if (includeFilters) {
      responsePayload.filters.available = await listAgencyFilters();
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('GET /api/branding/agencies failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to load agencies',
      },
      { status: 500 }
    );
  }
}

