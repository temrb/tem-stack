/**
 * Client-side session error handler
 *
 * This module provides client-side logic for handling session-related tRPC errors.
 * When a session invalidation error is detected, it automatically logs out the user
 * and redirects them to the appropriate login page.
 *
 * This is CLIENT-SIDE ONLY - uses browser APIs and next-auth/react
 */

import { TRPCClientError } from '@trpc/client';
import { signOut } from 'next-auth/react';

/**
 * Handles tRPC session-related errors on the client side
 *
 * When a session invalidation error is detected:
 * 1. Signs out the user (clears server and client session state)
 * 2. Redirects to the appropriate page (preserving intended destination)
 *
 * @param error - The tRPC error that occurred
 */
export function handleTRPCSessionError(error: unknown): void {
	// Check if this is a TRPCClientError
	if (!(error instanceof TRPCClientError)) {
		return;
	}

	// Check if this is a session invalidation error
	if (
		error.data?.cause?.shouldInvalidateSession === true &&
		error.data.httpStatus === 401
	) {
		// Extract redirect URL from the error, fallback to default
		const redirectUrl = error.data.cause.redirectUrl || '/get-started';

		// Sign out the user (clears NextAuth session)
		signOut({ redirect: false })
			.then(() => {
				// Perform hard navigation to ensure clean state
				if (typeof window !== 'undefined') {
					window.location.href = redirectUrl;
				}
			})
			.catch((signOutError) => {
				console.error('Error during sign out:', signOutError);
				// Even if sign out fails, still redirect to login
				if (typeof window !== 'undefined') {
					window.location.href = '/get-started';
				}
			});
	}
}

/**
 * Alternative handler that can be used with error boundaries or specific components
 * Returns a boolean indicating whether the error was a session error that was handled
 *
 * @param error - The error to check and potentially handle
 * @returns true if the error was a session error and was handled, false otherwise
 */
export function handleSessionErrorIfApplicable(error: unknown): boolean {
	if (
		error instanceof TRPCClientError &&
		error.data?.cause?.shouldInvalidateSession === true &&
		error.data.httpStatus === 401
	) {
		handleTRPCSessionError(error);
		return true;
	}

	return false;
}

/**
 * Utility function to check if an error is a session invalidation error
 * without handling it (useful for conditional logic in components)
 */
export function isSessionInvalidationError(error: unknown): boolean {
	return (
		error instanceof TRPCClientError &&
		error.data?.cause?.shouldInvalidateSession === true &&
		error.data.httpStatus === 401
	);
}
