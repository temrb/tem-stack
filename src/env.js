import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

const env = createEnv({
	/**
	 * Server-side environment variables schema
	 * These are only accessible on the server and never exposed to the client
	 */
	server: {
		// Build & Runtime
		ANALYZE: z.coerce.boolean().default(false),
		NODE_ENV: z
			.enum(['development', 'test', 'production'])
			.default('development'),

		// Authentication (Better Auth)
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.preprocess(
			// This makes Vercel deployments not fail if you don't set BETTER_AUTH_URL
			// Better Auth automatically uses the VERCEL_URL if present.
			(str) => process.env.VERCEL_URL ?? str,
			// VERCEL_URL doesn't include `https` so it cant be validated as a URL
			process.env.VERCEL ? z.string() : z.url().optional(),
		).optional(),

		// Cache (Upstash Redis)
		UPSTASH_REDIS_REST_URL: z.url(),
		UPSTASH_REDIS_REST_TOKEN: z.string(),

		// Databases (Dual Postgres)
		SITE_DATABASE_URL: z.url(),
		SITE_DIRECT_URL: z.url(),

		// OAuth Providers
		GOOGLE_CLIENT_ID: z.string(),
		GOOGLE_CLIENT_SECRET: z.string(),

		// AI API Keys (Optional - uncomment when needed)
		// OPENAI_API_KEY: z.string().optional(),
		// GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
	},

	/**
	 * Client-side environment variables schema
	 * These are exposed to the client and must be prefixed with NEXT_PUBLIC_
	 */
	client: {
		// Application Config
		NEXT_PUBLIC_APP_NAME: z.string(),
		NEXT_PUBLIC_APP_URL: z.url(),
		NEXT_PUBLIC_APP_DOMAIN: z.string(),

		// Analytics
		NEXT_PUBLIC_GTAG_ID: z.string(),
		NEXT_PUBLIC_CLARITY_PROJECT_ID: z.string(),

		// External Services
		NEXT_PUBLIC_FEATUREBASE_URL: z.string(),
	},

	/**
	 * Runtime environment mapping
	 * You can't destruct `process.env` as a regular object in Next.js edge runtimes
	 * (e.g. middlewares) or client-side, so we need to destruct manually.
	 */
	runtimeEnv: {
		// Build & Runtime
		ANALYZE: process.env.ANALYZE,
		NODE_ENV: process.env.NODE_ENV,

		// Authentication
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,

		// Cache
		UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
		UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,

		// Databases
		SITE_DATABASE_URL: process.env.SITE_DATABASE_URL,
		SITE_DIRECT_URL: process.env.SITE_DIRECT_URL,

		// OAuth Providers
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

		// AI API Keys (Optional - uncomment when needed)
		// OPENAI_API_KEY: process.env.OPENAI_API_KEY,
		// GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,

		// Application Config
		NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
		NEXT_PUBLIC_APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN,

		// Analytics
		NEXT_PUBLIC_GTAG_ID: process.env.NEXT_PUBLIC_GTAG_ID,
		NEXT_PUBLIC_CLARITY_PROJECT_ID:
			process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,

		// External Services
		NEXT_PUBLIC_FEATUREBASE_URL: process.env.NEXT_PUBLIC_FEATUREBASE_URL,
	},

	/**
	 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
	 * This is especially useful for Docker builds.
	 */
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,

	/**
	 * Makes it so that empty strings are treated as undefined.
	 * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
	 */
	emptyStringAsUndefined: true,
});

export default env;
