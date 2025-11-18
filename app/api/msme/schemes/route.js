import { NextResponse } from 'next/server';
import { getCachedValue, setCachedValue } from '@/lib/cache';

export const dynamic = 'force-dynamic';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const CACHE_NAMESPACE = 'msme-schemes';

/**
 * GET /api/msme/schemes
 * 
 * Fetches MSME-specific schemes and benefits
 * 
 * Query params:
 * - sector: Filter by sector
 * - state: Filter by state
 * - limit: Number of results (default: 20)
 * - refresh: Force refresh cache
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sector = searchParams.get('sector') || null;
    const state = searchParams.get('state') || null;
    const limit = Math.min(Number.parseInt(searchParams.get('limit') || '20', 10), 100);
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    const cacheKey = `schemes:${sector || 'all'}:${state || 'all'}:${limit}`;
    
    // Check cache
    if (!forceRefresh) {
      const cached = getCachedValue(CACHE_NAMESPACE, cacheKey);
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
          cached: true,
          source: 'cache',
        });
      }
    }

    // Fetch MSME schemes
    const schemes = await fetchMSMESchemes({ sector, state, limit });
    
    // Cache the result
    setCachedValue(CACHE_NAMESPACE, cacheKey, schemes, CACHE_TTL_MS);
    
    return NextResponse.json({
      success: true,
      data: schemes,
      cached: false,
      source: 'msme',
      count: schemes.length,
    });
  } catch (error) {
    console.error('GET /api/msme/schemes failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to fetch MSME schemes' },
      { status: 500 }
    );
  }
}

/**
 * Fetches MSME schemes from Ministry of MSME
 */
async function fetchMSMESchemes({ sector, state, limit }) {
  // Sample MSME schemes - in production, fetch from official sources
  const allSchemes = [
    {
      id: 'msme-1',
      title: 'Credit Guarantee Fund Trust for Micro and Small Enterprises',
      sector: 'all',
      state: 'all',
      description: 'Collateral-free credit facility for MSMEs',
      amount: 'Up to ₹2 Crores',
      interestRate: 'As per bank rates',
      eligibility: 'Registered MSMEs',
      link: 'https://www.cgtmse.in/',
      status: 'active',
    },
    {
      id: 'msme-2',
      title: 'Prime Minister Employment Generation Programme',
      sector: 'all',
      state: 'all',
      description: 'Subsidy for setting up new enterprises',
      amount: 'Up to ₹25 Lakhs (manufacturing), ₹10 Lakhs (service)',
      subsidy: '15-35% of project cost',
      eligibility: 'New MSMEs',
      link: 'https://msme.gov.in/',
      status: 'active',
    },
    {
      id: 'msme-3',
      title: 'Udyam Registration Benefits',
      sector: 'all',
      state: 'all',
      description: 'Various benefits for Udyam registered MSMEs',
      amount: 'Multiple benefits',
      benefits: ['Priority lending', 'Tax benefits', 'Government tenders'],
      eligibility: 'Udyam registered MSMEs',
      link: 'https://udyamregistration.gov.in/',
      status: 'active',
    },
    {
      id: 'msme-4',
      title: 'Technology Upgradation Support',
      sector: 'manufacturing',
      state: 'all',
      description: 'Support for technology upgradation in MSMEs',
      amount: 'Up to ₹1 Crore',
      subsidy: '25% of project cost',
      eligibility: 'Manufacturing MSMEs',
      link: 'https://msme.gov.in/',
      status: 'active',
    },
  ];

  // Filter by sector and state
  let filtered = allSchemes;
  
  if (sector && sector !== 'all') {
    filtered = filtered.filter(s => s.sector === sector || s.sector === 'all');
  }
  
  if (state && state !== 'all') {
    filtered = filtered.filter(s => s.state === state || s.state === 'all');
  }

  // Apply limit
  filtered = filtered.slice(0, limit);

  // TODO: Implement actual API integration or scraping
  // Example:
  // const response = await fetch('https://msme.gov.in/api/schemes');
  // const data = await response.json();
  
  return filtered;
}

