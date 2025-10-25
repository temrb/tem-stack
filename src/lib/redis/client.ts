import env from '@/env';
import { Redis } from '@upstash/redis';

/**
 * Shared Upstash Redis client instance
 *
 * USAGE: Rate limiting and feature-specific caching only
 *
 * This is a shared base Redis client that can be imported by any feature
 * that needs Redis functionality. Each feature should create its own
 * rate limiters and caching logic in their respective directories.
 *
 * IMPORTANT: Do NOT use for general application data caching
 * - React Query handles client-side caching (30s stale time)
 * - Next.js handles server-side caching (unstable_cache, revalidation)
 *
 * @example Feature-specific usage
 * ```ts
 * // src/features/feed/lib/upstash/rate-limiters.ts
 * import { redis } from '@/lib/redis/client';
 * export const postRatelimit = new Ratelimit({ redis, ... });
 * ```
 *
 * @see Feed rate limiters: src/features/feed/lib/upstash/rate-limiters.ts
 * @see Client cache config: src/trpc/query-client.ts
 */
export const redis = new Redis({
	url: env.UPSTASH_REDIS_REST_URL,
	token: env.UPSTASH_REDIS_REST_TOKEN,
});
