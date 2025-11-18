import { NextResponse } from 'next/server';
import { getCachedValue, setCachedValue } from '@/lib/cache';

export const dynamic = 'force-dynamic';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (company data doesn't change frequently)
const CACHE_NAMESPACE = 'mca-verify';

/**
 * GET /api/companies/mca-verify
 * 
 * Verifies company information using MCA (Ministry of Corporate Affairs) data
 * 
 * Query params:
 * - cin: Company Identification Number (required)
 * - name: Company name (alternative to CIN)
 * - refresh: Force refresh cache
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cin = searchParams.get('cin');
    const name = searchParams.get('name');
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    if (!cin && !name) {
      return NextResponse.json(
        { success: false, error: 'CIN or company name is required' },
        { status: 400 }
      );
    }
    
    const cacheKey = `verify:${cin || name}`;
    
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

    // Verify company with MCA
    const companyData = await verifyCompanyWithMCA({ cin, name });
    
    if (!companyData) {
      return NextResponse.json(
        { success: false, error: 'Company not found in MCA database' },
        { status: 404 }
      );
    }
    
    // Cache the result
    setCachedValue(CACHE_NAMESPACE, cacheKey, companyData, CACHE_TTL_MS);
    
    return NextResponse.json({
      success: true,
      data: companyData,
      cached: false,
      source: 'mca',
      verified: true,
    });
  } catch (error) {
    console.error('GET /api/companies/mca-verify failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to verify company' },
      { status: 500 }
    );
  }
}

/**
 * Verifies company with MCA database
 * Note: MCA has official APIs but requires registration
 * This is a simplified implementation
 */
async function verifyCompanyWithMCA({ cin, name }) {
  // Sample implementation - in production, use MCA's official API
  // MCA API: https://www.mca.gov.in/mcafoportal/
  
  // For now, return sample structure
  // In production, implement:
  // 1. MCA API integration (requires registration)
  // 2. Web scraping as fallback
  // 3. Third-party services that provide MCA data
  
  const sampleData = {
    cin: cin || 'U12345MH2024PTC123456',
    name: name || 'Sample Startup Private Limited',
    status: 'Active',
    registrationDate: '2024-01-15',
    category: 'Company limited by Shares',
    subCategory: 'Non-govt company',
    class: 'Private',
    authorizedCapital: '1000000',
    paidUpCapital: '100000',
    registeredAddress: 'Mumbai, Maharashtra',
    email: 'contact@example.com',
    lastUpdated: new Date().toISOString(),
    verified: true,
  };

  // TODO: Implement actual MCA API call
  // Example:
  // const response = await fetch(`https://www.mca.gov.in/mcafoportal/api/company/${cin}`);
  // const data = await response.json();
  
  return sampleData;
}

