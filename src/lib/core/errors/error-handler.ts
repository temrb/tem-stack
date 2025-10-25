import { TRPCClientError } from '@trpc/client';
import { toast } from 'sonner';
import { ZodError } from 'zod';
import { TRPC_ERROR_MESSAGES } from './error-messages';

interface ErrorResponse {
	data?: {
		zodError?: {
			fieldErrors?: Record<string, string[]>;
			formErrors?: string[];
		};
		code?: string;
	};
	message?: string;
}

/**
 * Formats error array into readable string
 */
const formatErrors = (errors: string[]): string => errors.join(', ');

/**
 * Formats field errors into readable string
 */
const formatFieldErrors = (fieldErrors: Record<string, string[]>): string =>
	Object.entries(fieldErrors)
		.map(
			([field, errors]) =>
				`${field}: ${Array.isArray(errors) ? formatErrors(errors) : String(errors)}`,
		)
		.join('; ');

/**
 * Handles Zod validation errors from TRPC responses
 */
const handleZodError = (
	zodError: NonNullable<ErrorResponse['data']>['zodError'],
): boolean => {
	if (!zodError) return false;

	// Handle field-specific errors
	if (zodError.fieldErrors && Object.keys(zodError.fieldErrors).length > 0) {
		toast.error(
			`Validation Error: ${formatFieldErrors(zodError.fieldErrors)}`,
		);
		return true;
	}

	// Handle form-level errors
	if (zodError.formErrors && zodError.formErrors.length > 0) {
		toast.error(`Validation Error: ${formatErrors(zodError.formErrors)}`);
		return true;
	}

	return false;
};

/**
 * Get user-friendly error message for TRPC error code
 */
const getTRPCErrorMessage = (
	code?: string,
	originalMessage?: string,
): string => {
	if (code && code in TRPC_ERROR_MESSAGES) {
		return (
			originalMessage ||
			TRPC_ERROR_MESSAGES[code as keyof typeof TRPC_ERROR_MESSAGES]
		);
	}
	return originalMessage || 'An unexpected error occurred';
};

/**
 * Formats Zod error issues into readable string
 */
const formatZodErrors = (issues: any[]): string =>
	issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');

/**
 * Error handler strategies for different error types
 */
const errorHandlers = {
	trpc: (error: TRPCClientError<any> & ErrorResponse) => {
		// Handle Zod validation errors first
		if (error.data?.zodError && handleZodError(error.data.zodError)) {
			return;
		}
		// Handle TRPC error codes
		const message = getTRPCErrorMessage(error.data?.code, error.message);
		toast.error(message);
	},
	zod: (error: ZodError) => {
		const message = `Validation Error: ${formatZodErrors(error.issues)}`;
		toast.error(message);
	},
	generic: (error: Error, fallback: string) => {
		toast.error(error.message || fallback);
	},
	unknown: (fallback: string) => {
		toast.error(fallback);
	},
};

/**
 * Handles TRPC errors and displays appropriate toast notifications
 * @param error - The error from TRPC mutation/query
 * @param fallbackMessage - Default message if no specific error message is found
 */
export function handleTRPCError(
	error: unknown,
	fallbackMessage = 'An error occurred',
): void {
	if (error instanceof TRPCClientError) {
		errorHandlers.trpc(error as TRPCClientError<any> & ErrorResponse);
	} else if (error instanceof ZodError) {
		errorHandlers.zod(error);
	} else if (error instanceof Error) {
		errorHandlers.generic(error, fallbackMessage);
	} else {
		errorHandlers.unknown(fallbackMessage);
	}
}

/**
 * Handles successful TRPC operations with toast notifications
 * @param message - Success message to display
 * @param result - Optional result data that might contain a message
 */
export function handleTRPCSuccess(
	message: string,
	result?: { message?: string },
): void {
	const successMessage = result?.message || message;
	toast.success(successMessage);
}

/**
 * A wrapper function for TRPC mutations that handles errors automatically
 * @param mutationFn - The TRPC mutation function
 * @param successMessage - Message to show on success
 * @param errorMessage - Custom error message (optional)
 */
export async function executeTRPCMutation<T>(
	mutationFn: () => Promise<T>,
	successMessage: string,
	errorMessage?: string,
): Promise<{ data: T | null; error: unknown | null }> {
	try {
		const data = await mutationFn();
		handleTRPCSuccess(successMessage, data as any);
		return { data, error: null };
	} catch (error) {
		handleTRPCError(error, errorMessage);
		return { data: null, error };
	}
}

/**
 * Extract user-friendly error message from TRPC error
 * @param error - The error to extract message from
 * @param fallback - Fallback message if no specific message found
 * @returns User-friendly error message
 */
export function extractErrorMessage(
	error: unknown,
	fallback = 'An error occurred',
): string {
	if (error instanceof TRPCClientError) {
		return error.message || fallback;
	} else if (error instanceof Error) {
		return error.message || fallback;
	}
	return fallback;
}
