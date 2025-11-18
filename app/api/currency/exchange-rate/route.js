import { NextResponse } from 'next/server';
import { getCachedValue, setCachedValue } from '@/lib/cache';

export const dynamic = 'force-dynamic';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour (exchange rates change frequently)
const CACHE_NAMESPACE = 'currency';

/**
 * GET /api/currency/exchange-rate
 * 
 * Get currency exchange rates using free API
 * 
 * Query params:
 * - from: Base currency code (e.g., USD, INR) - default: USD
 * - to: Target currency code (e.g., INR, EUR) - default: INR
 * - amount: Amount to convert (optional)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = (searchParams.get('from') || 'USD').toUpperCase();
    const to = (searchParams.get('to') || 'INR').toUpperCase();
    const amount = searchParams.get('amount') ? parseFloat(searchParams.get('amount')) : null;
    
    // Validate currency codes
    if (from.length !== 3 || to.length !== 3) {
      return NextResponse.json(
        { success: false, error: 'Invalid currency code. Use 3-letter codes (e.g., USD, INR, EUR)' },
        { status: 400 }
      );
    }
    
    const cacheKey = `${from}:${to}`;
    
    // Check cache
    const cached = getCachedValue(CACHE_NAMESPACE, cacheKey);
    if (cached) {
      const result = { ...cached };
      if (amount !== null) {
        result.convertedAmount = (amount * cached.rate).toFixed(2);
        result.originalAmount = amount;
      }
      return NextResponse.json({
        success: true,
        data: result,
        cached: true,
        source: 'cache',
      });
    }

    // Get exchange rate
    const rateData = await getExchangeRate(from, to);
    
    if (!rateData) {
      return NextResponse.json(
        { success: false, error: 'Unable to get exchange rate' },
        { status: 500 }
      );
    }
    
    // Cache the result
    setCachedValue(CACHE_NAMESPACE, cacheKey, rateData, CACHE_TTL_MS);
    
    const result = { ...rateData };
    if (amount !== null) {
      result.convertedAmount = (amount * rateData.rate).toFixed(2);
      result.originalAmount = amount;
    }
    
    return NextResponse.json({
      success: true,
      data: result,
      cached: false,
      source: 'exchangerate-api',
    });
  } catch (error) {
    console.error('GET /api/currency/exchange-rate failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to get exchange rate' },
      { status: 500 }
    );
  }
}

/**
 * Gets exchange rate using exchangerate-api.com (free tier)
 * Free tier: 1,500 requests/month
 * No API key required for basic usage
 */
async function getExchangeRate(from, to) {
  try {
    // Using exchangerate-api.com free tier
    // Alternative: fixer.io, currencyapi.net (require API keys)
    const url = `https://api.exchangerate-api.com/v4/latest/${from}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.rates || !data.rates[to]) {
      throw new Error(`Currency ${to} not found in rates`);
    }
    
    return {
      from,
      to,
      rate: data.rates[to],
      baseRate: data.rates[from] || 1,
      date: data.date || new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Exchange rate error:', error);
    throw error;
  }
}

