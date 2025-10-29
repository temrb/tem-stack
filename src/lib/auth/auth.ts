import { site } from '@/trpc/server/site';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';

// Helper to get env safely
const getEnv = () => {
	try {
		// During build/runtime, use the env module
		return require('@/env').default;
	} catch {
		// During CLI, fallback to process.env
		return process.env;
	}
};

const env = getEnv();

export const auth = betterAuth({
	database: prismaAdapter(site, {
		provider: 'postgresql',
	}),
	emailAndPassword: {
		enabled: false, // Not using email/password auth
	},
	socialProviders: {
		google: {
			clientId:
				env.GOOGLE_CLIENT_ID ||
				(process.env.GOOGLE_CLIENT_ID as string),
			clientSecret:
				env.GOOGLE_CLIENT_SECRET ||
				(process.env.GOOGLE_CLIENT_SECRET as string),
		},
	},
	user: {
		additionalFields: {
			role: {
				type: 'string',
				required: false,
				defaultValue: 'USER',
				input: false, // Don't allow user to set role
			},
			alias: {
				type: 'string',
				required: false,
			},
			onboardingCompleted: {
				type: 'boolean',
				required: false,
				defaultValue: false,
			},
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5, // 5 minutes
		},
	},
	plugins: [
		nextCookies(), // Automatically handles cookies in Server Actions
	],
	// logger: {
	// 	disabled: false,
	// 	disableColors: false,
	// 	level: 'error',
	// 	log: (level, message, ...args) => {
	// 		// Custom logging implementation
	// 		console.log(`[${level}] ${message}`, ...args);
	// 	},
	// },
	telemetry: {
		enabled: false,
	},
});

export type Session = typeof auth.$Infer.Session;
