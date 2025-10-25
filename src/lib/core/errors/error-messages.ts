import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';

/**
 * Centralized TRPC error messages
 *
 * This is the single source of truth for all TRPC error messages.
 * Used by both server-side error throwing and client-side error handling.
 *
 * @see https://trpc.io/docs/server/error-handling#error-codes
 */
export const TRPC_ERROR_MESSAGES = {
	PARSE_ERROR: 'Failed to parse the request',
	BAD_REQUEST: 'Invalid request. Please check your input',
	INTERNAL_SERVER_ERROR: 'An internal server error occurred',
	NOT_IMPLEMENTED: 'This feature is not yet implemented',
	BAD_GATEWAY: 'Bad gateway error occurred',
	SERVICE_UNAVAILABLE: 'Service is temporarily unavailable',
	GATEWAY_TIMEOUT: 'Gateway timeout occurred',
	UNAUTHORIZED: 'You must be logged in to access this resource',
	PAYMENT_REQUIRED: 'Payment is required to access this resource',
	FORBIDDEN: 'You do not have permission to perform this action',
	NOT_FOUND: 'The requested resource was not found',
	METHOD_NOT_SUPPORTED: 'This method is not supported',
	TIMEOUT: 'Request timed out. Please try again',
	CONFLICT: 'This action conflicts with existing data',
	PRECONDITION_FAILED: 'Precondition failed',
	PAYLOAD_TOO_LARGE: 'Request payload is too large',
	UNSUPPORTED_MEDIA_TYPE: 'Unsupported media type',
	UNPROCESSABLE_CONTENT: 'The request content could not be processed',
	PRECONDITION_REQUIRED: 'Required precondition header is missing',
	TOO_MANY_REQUESTS: 'Too many requests. Please try again later',
	CLIENT_CLOSED_REQUEST: 'Client closed the request',
} as const satisfies Record<TRPC_ERROR_CODE_KEY, string>;

/**
 * Type-safe helper to get error message by code
 */
export function getErrorMessage(code: TRPC_ERROR_CODE_KEY): string {
	return TRPC_ERROR_MESSAGES[code];
}

/**
 * Type for error message keys
 */
export type TRPCErrorCode = keyof typeof TRPC_ERROR_MESSAGES;
