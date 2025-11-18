import { NextResponse } from 'next/server';
import { getCachedValue, setCachedValue } from '@/lib/cache';

export const dynamic = 'force-dynamic';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_NAMESPACE = 'unsplash';

/**
 * GET /api/images/unsplash
 * 
 * Search for high-quality stock images from Unsplash
 * 
 * Query params:
 * - q: Search query (required)
 * - page: Page number (default: 1)
 * - perPage: Results per page (default: 10, max: 30)
 * - orientation: Image orientation (landscape, portrait, squarish) - optional
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10));
    const perPage = Math.min(Math.max(1, Number.parseInt(searchParams.get('perPage') || '10', 10)), 30);
    const orientation = searchParams.get('orientation') || null;
    
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Search query (q) is required' },
        { status: 400 }
      );
    }
    
    const cacheKey = `search:${query}:${page}:${perPage}:${orientation || 'all'}`;
    
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

    // Search Unsplash
    const images = await searchUnsplash({ query, page, perPage, orientation });
    
    if (!images || images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No images found' },
        { status: 404 }
      );
    }
    
    // Cache the result
    setCachedValue(CACHE_NAMESPACE, cacheKey, images, CACHE_TTL_MS);
    
    return NextResponse.json({
      success: true,
      data: images,
      cached: false,
      source: 'unsplash',
      count: images.length,
      page,
      perPage,
    });
  } catch (error) {
    console.error('GET /api/images/unsplash failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to search Unsplash' },
      { status: 500 }
    );
  }
}

/**
 * Searches Unsplash for images
 * Free tier: 50 requests/hour
 * Note: Requires UNSPLASH_ACCESS_KEY in .env for production use
 * For demo, we'll use a public endpoint or return sample data
 */
async function searchUnsplash({ query, page, perPage, orientation }) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!accessKey) {
    // Return sample data if API key not configured
    console.warn('UNSPLASH_ACCESS_KEY not configured, returning sample data');
    return generateSampleImages(query, perPage);
  }
  
  try {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      per_page: perPage.toString(),
    });
    
    if (orientation) {
      params.append('orientation', orientation);
    }
    
    const url = `https://api.unsplash.com/search/photos?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.map(photo => ({
      id: photo.id,
      description: photo.description || photo.alt_description || '',
      url: photo.urls.regular,
      thumb: photo.urls.thumb,
      small: photo.urls.small,
      full: photo.urls.full,
      raw: photo.urls.raw,
      download: photo.links.download,
      width: photo.width,
      height: photo.height,
      color: photo.color,
      photographer: {
        name: photo.user.name,
        username: photo.user.username,
        profileUrl: photo.user.links.html,
        avatar: photo.user.profile_image.medium,
      },
      likes: photo.likes,
      createdAt: photo.created_at,
    }));
  } catch (error) {
    console.error('Unsplash API error:', error);
    // Fallback to sample data
    return generateSampleImages(query, perPage);
  }
}

function generateSampleImages(query, count) {
  // Generate sample image data for demo purposes
  return Array.from({ length: Math.min(count, 5) }, (_, i) => ({
    id: `sample-${i + 1}`,
    description: `Sample image for "${query}"`,
    url: `https://images.unsplash.com/photo-${1500000000000 + i}?w=800&h=600&fit=crop`,
    thumb: `https://images.unsplash.com/photo-${1500000000000 + i}?w=200&h=200&fit=crop`,
    small: `https://images.unsplash.com/photo-${1500000000000 + i}?w=400&h=300&fit=crop`,
    full: `https://images.unsplash.com/photo-${1500000000000 + i}?w=2400&h=1800&fit=crop`,
    width: 800,
    height: 600,
    color: '#000000',
    photographer: {
      name: 'Sample Photographer',
      username: 'sample',
      profileUrl: 'https://unsplash.com/@sample',
      avatar: 'https://images.unsplash.com/placeholder-avatars/photo-1500000000000?w=100&h=100&fit=crop',
    },
    likes: Math.floor(Math.random() * 1000),
    createdAt: new Date().toISOString(),
    note: 'Sample data - configure UNSPLASH_ACCESS_KEY for real images',
  }));
}

