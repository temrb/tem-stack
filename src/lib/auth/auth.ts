import env from '@/env';
import {
	DEFAULT_USER_VALUES,
	SESSION_CONFIG,
} from '@/lib/auth/config/constants';
import { site } from '@/trpc/server/site';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
	database: prismaAdapter(site, {
		provider: 'postgresql',
	}),
	emailAndPassword: {
		enabled: false, // Not using email/password auth
	},
	// update `src/lib/auth/config/providers.ts` for each addition / update.
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
	user: {
		additionalFields: {
			role: {
				type: 'string',
				required: false,
				defaultValue: DEFAULT_USER_VALUES.role,
				input: false, // Don't allow user to set role
			},
			alias: {
				type: 'string',
				required: false,
			},
			onboardingCompleted: {
				type: 'boolean',
				required: false,
				defaultValue: DEFAULT_USER_VALUES.onboardingCompleted,
			},
		},
	},
	session: {
		expiresIn: SESSION_CONFIG.expiresIn,
		updateAge: SESSION_CONFIG.updateAge,
		cookieCache: {
			enabled: true,
			maxAge: SESSION_CONFIG.cookieCacheMaxAge,
		},
	},
	plugins: [
		nextCookies(), // Automatically handles cookies in Server Actions
	],
	telemetry: {
		enabled: false,
	},
});

export type Session = typeof auth.$Infer.Session;
