import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || '';

let redis: Redis | null = null;
const memoryCache = new Map<string, { value: any; expiresAt: number }>();

// Try initializing ioredis client if REDIS_URL is provided
if (REDIS_URL) {
  try {
    console.log('[CACHE] Connecting to Redis...');
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000
    });
    redis.on('connect', () => console.log('[CACHE] Redis connected successfully.'));
    redis.on('error', (err) => {
      console.warn('[CACHE] Redis connection error, running memory caching fallback:', err.message);
      redis = null; // force fallback on error
    });
  } catch (error: any) {
    console.warn('[CACHE] Failed to initialize Redis client, falling back to memory cache:', error.message);
  }
} else {
  console.log('[CACHE] No REDIS_URL found. Running with local in-memory cache fallback.');
}

/**
 * Cache Wrapper utility: short-circuits execution if cache hits.
 * @param key Unique key for cache retrieval
 * @param ttlSeconds Time-to-live in seconds
 * @param fetchFn Callback to fetch data on cache miss (e.g. database queries or AI API invocation)
 */
export async function cacheWrapper<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // If Redis is active, try to fetch key
  if (redis) {
    try {
      const cached = await redis.get(key);
      if (cached !== null) {
        // console.log(`[CACHE] Redis HIT: ${key}`);
        return JSON.parse(cached) as T;
      }
      
      // Cache miss: execute fetch
      const result = await fetchFn();
      
      // Cache the result
      await redis.set(key, JSON.stringify(result), 'EX', ttlSeconds);
      // console.log(`[CACHE] Redis MISS/SET: ${key}`);
      return result;
    } catch (err: any) {
      console.warn(`[CACHE] Redis execution failed, falling back to memory Cache:`, err.message);
    }
  }

  // Memory Cache Fallback
  const now = Date.now();
  const cachedVal = memoryCache.get(key);
  
  if (cachedVal && cachedVal.expiresAt > now) {
    // console.log(`[CACHE] Memory HIT: ${key}`);
    return cachedVal.value as T;
  }
  
  // Cache miss in memory
  const result = await fetchFn();
  memoryCache.set(key, {
    value: result,
    expiresAt: now + ttlSeconds * 1000
  });
  // console.log(`[CACHE] Memory MISS/SET: ${key}`);
  return result;
}

/**
 * Utility to clear cached keys matched by prefix/pattern (optional helpers)
 */
export async function invalidateCache(key: string): Promise<void> {
  if (redis) {
    try {
      await redis.del(key);
    } catch (err: any) {
      console.warn('[CACHE] Redis delete failed:', err.message);
    }
  }
  memoryCache.delete(key);
}
