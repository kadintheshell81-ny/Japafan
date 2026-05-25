/**
 * JAPAFAN — Jikan API Cache Proxy
 * Vercel Serverless Function (Node.js 18+)
 *
 * Shields the app from Jikan's 3 req/s rate limit by:
 * 1. Routing all Jikan requests through this server-side function
 * 2. Caching responses in-memory for 5 minutes (TTL = 300,000ms)
 *
 * Supported endpoints:
 *   GET /api/jikan-proxy?endpoint=top_anime
 *   GET /api/jikan-proxy?endpoint=search&q=death+note
 *   GET /api/jikan-proxy?endpoint=anime_details&id=1535
 */

// In-memory TTL cache — persists across warm invocations on the same instance
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const JIKAN_BASE = 'https://api.jikan.moe/v4';

// Map supported endpoint names to Jikan URLs
function resolveJikanUrl(endpoint, params) {
  switch (endpoint) {
    case 'top_anime':
      return `${JIKAN_BASE}/top/anime?limit=25&filter=bypopularity`;

    case 'search':
      if (!params.q) return null;
      return `${JIKAN_BASE}/anime?q=${encodeURIComponent(params.q)}&limit=10&sfw=true`;

    case 'anime_details':
      if (!params.id) return null;
      return `${JIKAN_BASE}/anime/${encodeURIComponent(params.id)}/full`;

    default:
      return null;
  }
}

// Build a deterministic cache key from endpoint + params
function buildCacheKey(endpoint, params) {
  const sorted = Object.keys(params)
    .filter(k => k !== 'endpoint')
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&');
  return `${endpoint}::${sorted}`;
}

module.exports = async function handler(req, res) {
  // CORS headers — allow the Japafan frontend to call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const { endpoint, ...rest } = req.query;

  if (!endpoint) {
    return res.status(400).json({
      error: 'Missing required query param: endpoint',
      supported: ['top_anime', 'search', 'anime_details']
    });
  }

  const jikanUrl = resolveJikanUrl(endpoint, rest);
  if (!jikanUrl) {
    return res.status(400).json({
      error: `Unknown endpoint "${endpoint}" or missing required params.`,
      supported: ['top_anime', 'search?q=...', 'anime_details?id=...']
    });
  }

  // Check in-memory cache
  const cacheKey = buildCacheKey(endpoint, rest);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`[jikan-proxy] Cache HIT: ${cacheKey}`);
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('X-Cache-Age', `${Math.floor((Date.now() - cached.timestamp) / 1000)}s`);
    return res.status(200).json(cached.data);
  }

  // Fetch from Jikan
  console.log(`[jikan-proxy] Cache MISS — fetching: ${jikanUrl}`);

  try {
    const response = await fetch(jikanUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Japafan/1.0 (anime social network)'
      },
      signal: AbortSignal.timeout(8000) // 8 second timeout
    });

    // Handle Jikan rate limit
    if (response.status === 429) {
      console.warn('[jikan-proxy] Jikan returned 429 — rate limited upstream');
      return res.status(503).json({
        error: 'Upstream rate limit reached. Please try again in a moment.',
        retryAfter: 3
      });
    }

    if (!response.ok) {
      console.error(`[jikan-proxy] Jikan error: ${response.status} ${response.statusText}`);
      return res.status(502).json({
        error: `Upstream error from Jikan: ${response.status}`,
        url: jikanUrl
      });
    }

    const data = await response.json();

    // Store in cache
    cache.set(cacheKey, { data, timestamp: Date.now() });

    // Evict stale entries to prevent unbounded memory growth (keep max 100 entries)
    if (cache.size > 100) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    return res.status(200).json(data);

  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      console.error('[jikan-proxy] Request timed out');
      return res.status(504).json({ error: 'Request to Jikan timed out. Please try again.' });
    }

    console.error('[jikan-proxy] Unexpected error:', err.message);
    return res.status(500).json({ error: 'Internal proxy error.', details: err.message });
  }
}
