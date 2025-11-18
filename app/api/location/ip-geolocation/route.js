import { NextResponse } from 'next/server';
import { getCachedValue, setCachedValue } from '@/lib/cache';

export const dynamic = 'force-dynamic';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_NAMESPACE = 'ip-geolocation';

/**
 * GET /api/location/ip-geolocation
 * 
 * Get geolocation data from IP address using free IP geolocation API
 * 
 * Query params:
 * - ip: IP address (optional, defaults to request IP)
 * - provider: API provider (ipapi, ipapi) - default: ipapi
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ip = searchParams.get('ip') || getClientIP(request);
    const provider = searchParams.get('provider') || 'ipapi';
    
    if (!ip) {
      return NextResponse.json(
        { success: false, error: 'IP address is required' },
        { status: 400 }
      );
    }
    
    // Validate IP format
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      return NextResponse.json(
        { success: false, error: 'Invalid IP address format' },
        { status: 400 }
      );
    }
    
    const cacheKey = `${provider}:${ip}`;
    
    // Check cache
    const cached = getCachedValue(CACHE_NAMESPACE, cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
        source: 'cache',
      });
    }

    // Get geolocation data
    const geoData = await getIPGeolocation(ip, provider);
    
    if (!geoData) {
      return NextResponse.json(
        { success: false, error: 'Unable to get geolocation data' },
        { status: 500 }
      );
    }
    
    // Cache the result
    setCachedValue(CACHE_NAMESPACE, cacheKey, geoData, CACHE_TTL_MS);
    
    return NextResponse.json({
      success: true,
      data: geoData,
      cached: false,
      source: provider,
      ip,
    });
  } catch (error) {
    console.error('GET /api/location/ip-geolocation failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to get IP geolocation' },
      { status: 500 }
    );
  }
}

/**
 * Gets IP geolocation using free API
 * Uses ip-api.com (free tier: 45 requests/minute)
 */
async function getIPGeolocation(ip, provider = 'ipapi') {
  try {
    let url;
    
    if (provider === 'ipapi') {
      // ip-api.com (free, no API key needed)
      url = `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`;
    } else {
      // Fallback to ip-api.com
      url = `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`IP geolocation API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'fail') {
      throw new Error(data.message || 'IP geolocation failed');
    }
    
    return {
      ip: data.query || ip,
      country: data.country || null,
      countryCode: data.countryCode || null,
      region: data.regionName || null,
      regionCode: data.region || null,
      city: data.city || null,
      zip: data.zip || null,
      latitude: data.lat || null,
      longitude: data.lon || null,
      timezone: data.timezone || null,
      isp: data.isp || null,
      organization: data.org || null,
      as: data.as || null,
    };
  } catch (error) {
    console.error('IP geolocation error:', error);
    throw error;
  }
}

function getClientIP(request) {
  // Try to get IP from headers (for production with proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  // Fallback (won't work in serverless, but good for development)
  return null;
}

