import type { createTRPCContext } from './trpc';

// Define Context type based on the return type of createTRPCContext
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Gets the current user from the tRPC context
 * @param ctx The tRPC context
 * @returns The user object or null if not authenticated
 */
export const getUserFromContext = (ctx: Context) => {
	return ctx.session?.user ?? null;
};

/**
 * Checks if a user has admin privileges
 * @param user The user object to check
 * @returns true if the user is an admin, false otherwise
 */
export const isAdmin = (user: Context['session']['user'] | null): boolean => {
	if (!user) return false;

	// Check if user has admin role
	return user.role === 'ADMIN';
};
