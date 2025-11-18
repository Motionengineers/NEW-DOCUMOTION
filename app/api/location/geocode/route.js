import { NextResponse } from 'next/server';
import { getCachedValue, setCachedValue } from '@/lib/cache';

export const dynamic = 'force-dynamic';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (locations don't change)
const CACHE_NAMESPACE = 'geocode';

/**
 * GET /api/location/geocode
 * 
 * Geocoding using OpenStreetMap Nominatim API (free)
 * Converts address to coordinates or coordinates to address
 * 
 * Query params:
 * - q: Address to geocode (forward geocoding)
 * - lat: Latitude (reverse geocoding)
 * - lon: Longitude (reverse geocoding)
 * - format: Response format (json, xml) - default: json
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('q');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const format = searchParams.get('format') || 'json';
    
    if (!address && (!lat || !lon)) {
      return NextResponse.json(
        { success: false, error: 'Either address (q) or coordinates (lat, lon) is required' },
        { status: 400 }
      );
    }
    
    const cacheKey = address 
      ? `forward:${address.toLowerCase().trim()}`
      : `reverse:${lat},${lon}`;
    
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

    // Call OpenStreetMap Nominatim API
    const geocodeData = await geocodeWithOSM({ address, lat, lon, format });
    
    if (!geocodeData || geocodeData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No results found' },
        { status: 404 }
      );
    }
    
    // Cache the result
    setCachedValue(CACHE_NAMESPACE, cacheKey, geocodeData, CACHE_TTL_MS);
    
    return NextResponse.json({
      success: true,
      data: geocodeData,
      cached: false,
      source: 'openstreetmap',
    });
  } catch (error) {
    console.error('GET /api/location/geocode failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to geocode location' },
      { status: 500 }
    );
  }
}

/**
 * Geocodes using OpenStreetMap Nominatim API
 * Rate limit: 1 request/second (free tier)
 */
async function geocodeWithOSM({ address, lat, lon, format }) {
  const baseUrl = 'https://nominatim.openstreetmap.org';
  let url;
  
  if (address) {
    // Forward geocoding (address to coordinates)
    url = `${baseUrl}/search?q=${encodeURIComponent(address)}&format=${format}&limit=5&addressdetails=1`;
  } else {
    // Reverse geocoding (coordinates to address)
    url = `${baseUrl}/reverse?lat=${lat}&lon=${lon}&format=${format}&addressdetails=1`;
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Documotion/1.0 (contact@documotion.in)', // Required by OSM
      },
    });
    
    if (!response.ok) {
      throw new Error(`OSM API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Format response
    if (address) {
      // Forward geocoding returns array
      return Array.isArray(data) ? data.map(formatOSMResult) : [formatOSMResult(data)];
    } else {
      // Reverse geocoding returns single object
      return formatOSMResult(data);
    }
  } catch (error) {
    console.error('OSM geocoding error:', error);
    throw error;
  }
}

function formatOSMResult(result) {
  if (!result) return null;
  
  return {
    displayName: result.display_name || result.name || '',
    lat: parseFloat(result.lat) || null,
    lon: parseFloat(result.lon) || null,
    address: result.address || {},
    placeId: result.place_id || null,
    type: result.type || result.class || null,
    importance: result.importance || null,
  };
}

