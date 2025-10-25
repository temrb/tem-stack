import type { FieldErrors, FieldValues } from 'react-hook-form';
import { toast } from 'sonner';

/**
 * Creates a generic error handler for react-hook-form submissions.
 * It iterates over form errors and displays a toast notification for the first error found.
 * @returns A function to be used as the `onError` callback in `form.handleSubmit`.
 */
export function createFormErrorHandler<T extends FieldValues>() {
	return (errors: FieldErrors<T>) => {
		// Find the first error message in the errors object
		const error = Object.values(errors).find((e) => e?.message);
		if (error && typeof error.message === 'string') {
			toast.error(error.message);
		} else {
			toast.error('An unexpected form error occurred. Please try again.');
		}
	};
}
