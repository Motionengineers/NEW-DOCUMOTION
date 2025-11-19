import crypto from 'crypto';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import computeStateMatches from '@/lib/stateMatching';
import { logger } from '@/lib/logger';
import { getCache as getRedisCache, setCache as setRedisCache } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';

const MAX_LIMIT = 10;
const SAMPLE_SCHEMES = 400;
const CACHE_TTL_MS = 5 * 60 * 1000;

const memoryCache = new Map();

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
    prefersGrant:
      body.prefersGrant ?? body.preferredBenefit?.toString().toLowerCase() === 'grant',
  };
}

function sanitizePreferences(preferences = {}, priority = '') {
  const normalized = {
    sector: preferences.sectorWeight ?? null,
    funding: preferences.fundingWeight ?? null,
    interest: preferences.interestWeight ?? null,
    stage: preferences.stageWeight ?? null,
    registration: preferences.registrationWeight ?? null,
  };

  if (priority === 'grants') {
    normalized.interest = Math.max(normalized.interest ?? 0.25, 0.25);
    normalized.funding = Math.max(normalized.funding ?? 0.3, 0.3);
  } else if (priority === 'equity') {
    normalized.funding = Math.max(normalized.funding ?? 0.35, 0.35);
    normalized.sector = Math.max(normalized.sector ?? 0.35, 0.35);
  }

  return Object.fromEntries(
    Object.entries(normalized).filter(([, value]) => typeof value === 'number')
  );
}

function buildCacheKey(payload) {
  const hash = crypto
    .createHash('sha1')
    .update(JSON.stringify(payload))
    .digest('hex');
  return `funding:match:${hash}`;
}

async function getCachedMatch(key) {
  const redisValue = await getRedisCache(key);
  if (redisValue) return redisValue;
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

async function setCachedMatch(key, data) {
  memoryCache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
  await setRedisCache(key, data, Math.floor(CACHE_TTL_MS / 1000));
}

function buildSchemeWhere(profile) {
  const where = {};
  const filters = [];
  if (profile.industry) {
    filters.push(
      { sector: { contains: profile.industry, mode: 'insensitive' } },
      { subSector: { contains: profile.industry, mode: 'insensitive' } }
    );
  }
  if (profile.stage) {
    filters.push({ tags: { contains: profile.stage, mode: 'insensitive' } });
  }
  if (filters.length) {
    where.OR = filters;
  }

  const required = profile.requiredFunding;
  if (required) {
    where.AND = [
      {
        OR: [
          { fundingMin: null },
          { fundingMin: { lte: required * 1.5 } },
        ],
      },
      {
        OR: [
          { fundingMax: null },
          { fundingMax: { gte: required * 0.5 } },
        ],
      },
    ];
  }

  return where;
}

export async function POST(request) {
  try {
    const payload = await request.json().catch(() => ({}));
    const limit = Math.min(Math.max(parseInt(payload.limit ?? '5', 10) || 5, 1), MAX_LIMIT);
    const profile = sanitizeProfile(payload);
    const weights = sanitizePreferences(payload.preferences || {}, payload.priority || '');

    const cacheKey = buildCacheKey({ profile, limit, weights });
    const cached = await getCachedMatch(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const schemeWhere = buildSchemeWhere(profile);

    const [states, schemes, approvedCounts] = await Promise.all([
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
        where: schemeWhere,
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
          tags: true,
        },
        orderBy: { popularityScore: 'desc' },
        take: SAMPLE_SCHEMES,
      }),
      prisma.fundingApplication.groupBy({
        by: ['state'],
        where: { status: 'approved' },
        _count: { _all: true },
      }),
    ]);

    const historyStats = {};
    const stateMap = new Map(
      states.map(state => [state.name?.toLowerCase(), state.id])
    );
    approvedCounts.forEach(entry => {
      if (!entry.state) return;
      const key = entry.state.toLowerCase();
      const stateId = stateMap.get(key);
      if (!stateId) return;
      const total = entry._count?._all || 0;
      if (total <= 0) return;
      historyStats[stateId] = {
        successRate: Math.min(1, total / 20),
        total,
      };
    });

    const ranked = computeStateMatches(profile, states, schemes, {
      limit,
      weights,
      schemePreviewLimit: 2,
      historyStats,
    });

    const responsePayload = {
      success: true,
      data: {
        profile,
        preferences: weights,
        recommendedState: ranked[0]?.state ?? null,
        recommendations: ranked.map(rec => ({
          ...rec,
          breakdown: rec.explanation?.map(item => ({
            label: item.key,
            value: item.value,
            weight: item.weight,
            note: item.note,
          })),
        })),
      },
    };

    await setCachedMatch(cacheKey, responsePayload);

    logger.info({
      event: 'state_match_generated',
      profile,
      topState: ranked[0]?.stateName ?? null,
      timestamp: Date.now(),
    });

    return NextResponse.json(responsePayload);
  } catch (error) {
    logger.error('POST /api/funding/match failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to compute match score' },
      { status: 500 }
    );
  }
}
