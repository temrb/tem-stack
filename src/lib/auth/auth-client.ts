import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { auth } from './auth';

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4242',
	plugins: [
		inferAdditionalFields<typeof auth>(), // Infer additional fields from server config
	],
});

// Export commonly used functions
export const { useSession, signIn, signOut, getSession } = authClient;

// Export inferred types for convenience
export type ClientSession = typeof authClient.$Infer.Session;
