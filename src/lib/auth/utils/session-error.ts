/**
 * Shared session error utilities
 *
 * This module provides common session error detection logic that can be used
 * by both server-side and client-side code.
 */

/**
 * Checks if an error object contains session invalidation metadata
 * This is the core logic for detecting session invalidation errors
 *
 * @param errorData - The error data object to check
 * @returns true if the error data indicates a session should be invalidated
 */
export function hasSessionInvalidationFlag(errorData: any): boolean {
	return errorData?.cause?.shouldInvalidateSession === true;
}

/**
 * Checks if an error indicates an unauthorized request
 *
 * @param error - The error object to check
 * @returns true if the error is an unauthorized error
 */
export function isUnauthorizedError(error: any): boolean {
	return (
		error?.code === 'UNAUTHORIZED' || error?.data?.httpStatus === 401
	);
}

/**
 * Generic session invalidation error checker
 * Works with both server-side and client-side error objects
 *
 * @param error - The error object to check
 * @returns true if the error is a session invalidation error
 */
export function isSessionInvalidationError(error: any): boolean {
	return (
		hasSessionInvalidationFlag(error?.data || error) &&
		isUnauthorizedError(error)
	);
}
