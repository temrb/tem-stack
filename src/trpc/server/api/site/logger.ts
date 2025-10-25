/**
 * Helper function for structured error logging
 */
const logError = (
	context: string,
	error: unknown,
	metadata: Record<string, unknown> = {},
) => {
	const errorMessage =
		error instanceof Error ? error.message : 'Unknown error';
	const stack = error instanceof Error ? error.stack : undefined;

	console.error(`Error in ${context}:`, {
		...metadata,
		message: errorMessage,
		...(process.env.NODE_ENV === 'development' && { stack }),
	});
};

export { logError };
