import env from '@/env';
import {
	isValidProvider,
	type SocialProvider,
} from '@/lib/auth/config/providers';
import { InferAuth } from 'better-auth/client';
import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { auth } from './auth';

export const authClient = createAuthClient({
	baseURL: env.NEXT_PUBLIC_APP_URL,
	$InferAuth: InferAuth<typeof auth>(),
	plugins: [
		inferAdditionalFields<typeof auth>(), // Infer additional fields from server config
	],
});

// Export commonly used functions
export const { useSession, signIn, signOut, getSession } = authClient;

// Export inferred types for convenience
export type ClientSession = typeof authClient.$Infer.Session;
export type AuthClient = typeof authClient;

// Re-export SocialProvider type for convenience
export type { SocialProvider };

/**
 * Type-safe wrapper for social sign-in with runtime validation
 */
export const signInSocial = async (options: {
	provider: SocialProvider;
	callbackURL?: string;
	errorCallbackURL?: string;
}) => {
	if (!isValidProvider(options.provider)) {
		throw new Error(`Invalid social provider: ${options.provider}`);
	}

	return authClient.signIn.social({
		provider: options.provider,
		callbackURL: options.callbackURL,
		errorCallbackURL: options.errorCallbackURL,
	});
};
