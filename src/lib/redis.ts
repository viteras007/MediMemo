import { Redis } from '@upstash/redis'

// Initialize Redis client using environment variables
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env
export const redis = Redis.fromEnv()

// Cache configuration
export const CACHE_TTL = 604800 // 7 days in seconds
export const CACHE_KEY_PREFIX = 'pdf:' 