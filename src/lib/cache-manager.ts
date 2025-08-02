import { redis, CACHE_TTL, CACHE_KEY_PREFIX } from './redis';
import { sha256 } from './utils';

export interface CacheManager {
  get(key: string): Promise<any | null>;
  set(key: string, value: any): Promise<void>;
  isEnabled(): boolean;
}

export class RedisCacheManager implements CacheManager {
  async get(key: string): Promise<any | null> {
    try {
      return await redis.get(key);
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      await redis.set(key, value, { ex: CACHE_TTL });
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  isEnabled(): boolean {
    return true;
  }
}

export class NoCacheManager implements CacheManager {
  async get(key: string): Promise<any | null> {
    return null;
  }

  async set(key: string, value: any): Promise<void> {
    // Do nothing
  }

  isEnabled(): boolean {
    return false;
  }
}

export function createCacheManager(): CacheManager {
  const useCache = process.env.USE_CACHE !== "false";
  
  if (useCache) {
    return new RedisCacheManager();
  } else {
    return new NoCacheManager();
  }
}

export function generateCacheKey(content: string): string {
  const contentHash = sha256(content);
  return `${CACHE_KEY_PREFIX}${contentHash}`;
} 