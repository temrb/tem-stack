import { TRPCError } from '@trpc/server';

// Types for the result object with discriminated union
type Success<T> = {
	data: T;
	error: null;
};

type Failure<E> = {
	data: null;
	error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

// Main wrapper function with named export
const tryCatch = async <T, E = Error>(
	promiseOrFunction: Promise<T> | (() => Promise<T>),
): Promise<Result<T, E>> => {
	try {
		const promise =
			typeof promiseOrFunction === 'function'
				? promiseOrFunction()
				: promiseOrFunction;
		const data = await promise;
		return { data, error: null };
	} catch (error) {
		// Re-throw TRPCError instances to allow proper error propagation
		if (error instanceof TRPCError) {
			throw error;
		}
		process.env.NODE_ENV === 'development' &&
			console.log('🚀 ~ tryCatch ~ error:', error);
		return { data: null, error: error as E };
	}
};

// Keep default export for backward compatibility during transition
export default tryCatch;
