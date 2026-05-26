import { z } from 'zod';
import { createRequestId, jsonError, jsonOk } from '@/lib/http';

export const dynamic = 'force-dynamic';

const PreviewSchema = z.object({
  url: z.string().url(),
});

/**
 * POST /api/feed/link-preview
 * Fetch Open Graph metadata for a URL
 */
export async function POST(request) {
  const rid = createRequestId();

  try {
    const body = await request.json();
    const parsed = PreviewSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('invalid_params', 'Invalid URL', 400, rid);
    }

    const { url } = parsed.data;

    // Fetch the URL and parse HTML for OG tags
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DocumotionBot/1.0)',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        return jsonError('fetch_failed', 'Failed to fetch URL', 400, rid);
      }

      const html = await response.text();

      // Robust regex-based OG tag extraction
      const extractMeta = name => {
        const reg = new RegExp(
          `<meta[^>]+(?:property|name)=["']og:${name}["'][^>]+content=["']([^"']+)["']`,
          'i'
        );
        const regAlt = new RegExp(
          `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:${name}["']`,
          'i'
        );
        return html.match(reg)?.[1] || html.match(regAlt)?.[1] || null;
      };

      const title =
        extractMeta('title') || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || null;
      const description =
        extractMeta('description') ||
        html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1] ||
        null;
      const image = extractMeta('image') || extractMeta('image:url');
      const siteName = extractMeta('site_name');

      return jsonOk(
        {
          url,
          title,
          description,
          image,
          siteName,
        },
        rid
      );
    } catch (fetchError) {
      console.error(
        JSON.stringify({
          level: 'error',
          rid,
          route: '/api/feed/link-preview',
          msg: String(fetchError),
        })
      );
      return jsonError('fetch_failed', 'Failed to fetch URL metadata', 400, rid);
    }
  } catch (error) {
    console.error(
      JSON.stringify({ level: 'error', rid, route: '/api/feed/link-preview', msg: String(error) })
    );
    return jsonError('internal_error', 'An unexpected error occurred', 500, rid);
  }
}
