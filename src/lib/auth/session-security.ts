/**
 * Server-side session security validation module
 *
 * This module provides centralized session validation logic for tRPC procedures.
 * It ensures that all protected endpoints validate user session integrity consistently.
 *
 * IMPORTANT: This is SERVER-SIDE ONLY - no browser/client-side APIs are used here.
 */

import type { UserRole } from '@/prisma/site/.generated/enums';
import { TRPCError } from '@trpc/server';
import type { Session } from './auth';

interface SessionContext {
	session: Session | null;
	headers?: Headers;
}

interface ValidatedUser {
	id: string;
	email: string;
	name: string;
	image?: string | null;
	role?: UserRole;
	alias?: string | null;
	onboardingCompleted?: boolean;
}

/**
 * Validates the integrity of a session and its user data
 *
 * @param ctx - The tRPC context containing session information
 * @returns true if session is valid, false otherwise
 */
export function validateSessionSecurity(ctx: SessionContext): boolean {
	// Check if session exists
	if (!ctx.session) {
		return false;
	}

	// Check if user object exists within session
	if (!ctx.session.user) {
		return false;
	}

	// Check if user has required ID field
	if (
		!ctx.session.user.id ||
		typeof ctx.session.user.id !== 'string' ||
		ctx.session.user.id.trim() === ''
	) {
		return false;
	}

	// Check if user has required email field
	if (
		!ctx.session.user.email ||
		typeof ctx.session.user.email !== 'string' ||
		ctx.session.user.email.trim() === ''
	) {
		return false;
	}

	// All validation checks passed
	return true;
}

/**
 * Type guard to ensure session context has a valid user
 */
const hasValidUser = (
	ctx: SessionContext,
): ctx is SessionContext & {
	session: NonNullable<SessionContext['session']> & {
		user: ValidatedUser;
	};
} => {
	return validateSessionSecurity(ctx);
};

/**
 * Enforces session security by validating and returning validated user or throwing error
 *
 * @param ctx - The tRPC context containing session information
 * @returns The validated user object (non-nullable)
 * @throws TRPCError with UNAUTHORIZED code if session is invalid
 */
export function enforceSessionSecurity(ctx: SessionContext): ValidatedUser {
	if (!hasValidUser(ctx)) {
		// Generate redirect URL from request headers if available
		let redirectUrl = '/get-started';

		if (ctx.headers) {
			const referer = ctx.headers.get('referer');
			const host = ctx.headers.get('host');

			if (referer && host) {
				try {
					const refererUrl = new URL(referer);
					const currentPath = refererUrl.pathname + refererUrl.search;

					// Only preserve the redirect if it's from the same host
					if (
						refererUrl.host === host &&
						currentPath !== '/get-started'
					) {
						redirectUrl = `/get-started?redirectTo=${encodeURIComponent(currentPath)}`;
					}
				} catch {
					// If URL parsing fails, use default redirect
				}
			}
		}

		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'Invalid session. Please log in again.',
			cause: {
				shouldInvalidateSession: true,
				redirectUrl,
			},
		});
	}

	// Type guard ensures this is safe without assertion
	return ctx.session.user;
}

// Export the shared session error utility for convenience
export { isSessionInvalidationError } from './utils/session-error';
