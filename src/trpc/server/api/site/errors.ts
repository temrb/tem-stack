import { TRPC_ERROR_MESSAGES } from '@/lib/core/errors/error-messages';
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';
import { errorCode } from './trpc';

/**
 * Generic error throwing function
 * @param code - TRPC error code
 * @param message - Custom error message (optional, uses default if not provided)
 */
const throwError = (code: TRPC_ERROR_CODE_KEY, message?: string): never => {
	throw new errorCode({
		code,
		message: message ?? TRPC_ERROR_MESSAGES[code],
	});
};

/**
 * Creates error throwing functions dynamically
 */
const createErrorThrower =
	(code: TRPC_ERROR_CODE_KEY) =>
	(message?: string): never =>
		throwError(code, message);

/**
 * Utility class for throwing TRPC errors with fluent API
 */
export class TRPCThrow {
	static parseError = createErrorThrower('PARSE_ERROR');
	static badRequest = createErrorThrower('BAD_REQUEST');
	static internalError = createErrorThrower('INTERNAL_SERVER_ERROR');
	static notImplemented = createErrorThrower('NOT_IMPLEMENTED');
	static badGateway = createErrorThrower('BAD_GATEWAY');
	static serviceUnavailable = createErrorThrower('SERVICE_UNAVAILABLE');
	static gatewayTimeout = createErrorThrower('GATEWAY_TIMEOUT');
	static unauthorized = createErrorThrower('UNAUTHORIZED');
	static paymentRequired = createErrorThrower('PAYMENT_REQUIRED');
	static forbidden = createErrorThrower('FORBIDDEN');
	static notFound = createErrorThrower('NOT_FOUND');
	static methodNotSupported = createErrorThrower('METHOD_NOT_SUPPORTED');
	static conflict = createErrorThrower('CONFLICT');
	static preconditionFailed = createErrorThrower('PRECONDITION_FAILED');
	static payloadTooLarge = createErrorThrower('PAYLOAD_TOO_LARGE');
	static unsupportedMediaType = createErrorThrower('UNSUPPORTED_MEDIA_TYPE');
	static unprocessableContent = createErrorThrower('UNPROCESSABLE_CONTENT');
	static preconditionRequired = createErrorThrower('PRECONDITION_REQUIRED');
	static tooManyRequests = createErrorThrower('TOO_MANY_REQUESTS');
	static timeout = createErrorThrower('TIMEOUT');
	static clientClosedRequest = createErrorThrower('CLIENT_CLOSED_REQUEST');
}

// Export the generic error throwing function for advanced use cases
export { throwError };

// Re-export error messages for backward compatibility
export { TRPC_ERROR_MESSAGES as ERROR_MESSAGES };
