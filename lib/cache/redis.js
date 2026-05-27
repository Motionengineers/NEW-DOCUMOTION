const memoryStore = new Map();

function parseEntry(raw) {
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw);
    if (entry.expiresAt && entry.expiresAt < Date.now()) return null;
    return entry.value;
  } catch {
    return null;
  }
}

export async function getCache(key) {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      return await redis.get(key);
    } catch {
      // fall through to memory cache
    }
  }

  return parseEntry(memoryStore.get(key));
}

export async function setCache(key, value, ttlSeconds = 300) {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      await redis.set(key, value, { ex: ttlSeconds });
      return;
    } catch {
      // fall through to memory cache
    }
  }

  memoryStore.set(
    key,
    JSON.stringify({
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    })
  );
}

export const CACHE_KEYS = {
  user: {
    dashboard: userId => `user:${userId}:dashboard`,
  },
};

export async function cache(key, fn, ttlSeconds = 300) {
  const cached = await getCache(key);
  if (cached !== null && cached !== undefined) {
    return cached;
  }
  const value = await fn();
  await setCache(key, value, ttlSeconds);
  return value;
}
