import { NextResponse } from 'next/server';
import { getCachedValue, setCachedValue } from '@/lib/cache';

export const dynamic = 'force-dynamic';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const CACHE_NAMESPACE = 'startup-india';

/**
 * GET /api/startup-india/schemes
 * 
 * Fetches schemes and resources from Startup India Hub
 * 
 * Query params:
 * - category: Filter by category (funding, mentorship, incubation, etc.)
 * - limit: Number of results (default: 20)
 * - refresh: Force refresh cache
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || null;
    const limit = Math.min(Number.parseInt(searchParams.get('limit') || '20', 10), 100);
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    const cacheKey = `schemes:${category || 'all'}:${limit}`;
    
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

    // Fetch from Startup India Hub
    const schemes = await fetchStartupIndiaSchemes({ category, limit });
    
    // Cache the result
    setCachedValue(CACHE_NAMESPACE, cacheKey, schemes, CACHE_TTL_MS);
    
    return NextResponse.json({
      success: true,
      data: schemes,
      cached: false,
      source: 'startup-india',
      count: schemes.length,
    });
  } catch (error) {
    console.error('GET /api/startup-india/schemes failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to fetch Startup India schemes' },
      { status: 500 }
    );
  }
}

/**
 * Fetches schemes from Startup India Hub
 * Note: Startup India doesn't have a public API, so this would:
 * 1. Scrape their website
 * 2. Use their official data feeds if available
 * 3. Fall back to curated database
 */
async function fetchStartupIndiaSchemes({ category, limit }) {
  // Sample data structure - in production, implement scraping or use official API
  const allSchemes = [
    {
      id: 'si-1',
      title: 'Startup India Seed Fund Scheme',
      category: 'funding',
      description: 'Financial assistance to startups for proof of concept, prototype development, product trials',
      amount: 'Up to ₹50 Lakhs',
      eligibility: 'Registered startups less than 2 years old',
      link: 'https://www.startupindia.gov.in/content/sih/en/government-schemes/seed-fund-scheme.html',
      status: 'active',
    },
    {
      id: 'si-2',
      title: 'Credit Guarantee Scheme for Startups',
      category: 'funding',
      description: 'Credit guarantee to startups for loans without collateral',
      amount: 'Up to ₹10 Crores',
      eligibility: 'DIPP recognized startups',
      link: 'https://www.startupindia.gov.in/content/sih/en/government-schemes/credit-guarantee-scheme.html',
      status: 'active',
    },
    {
      id: 'si-3',
      title: 'Startup India Learning Program',
      category: 'mentorship',
      description: 'Free online learning program for entrepreneurs',
      amount: 'Free',
      eligibility: 'All entrepreneurs',
      link: 'https://www.startupindia.gov.in/content/sih/en/learning-and-development.html',
      status: 'active',
    },
    {
      id: 'si-4',
      title: 'Incubator Support Program',
      category: 'incubation',
      description: 'Support for incubators to nurture startups',
      amount: 'Up to ₹10 Crores',
      eligibility: 'Registered incubators',
      link: 'https://www.startupindia.gov.in/content/sih/en/government-schemes/incubator-support.html',
      status: 'active',
    },
  ];

  // Filter by category if provided
  let filtered = category
    ? allSchemes.filter(s => s.category === category)
    : allSchemes;

  // Apply limit
  filtered = filtered.slice(0, limit);

  // TODO: Implement actual scraping or API integration
  // Example:
  // const response = await fetch('https://www.startupindia.gov.in/api/schemes');
  // const data = await response.json();
  
  return filtered;
}

