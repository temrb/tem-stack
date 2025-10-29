import type { Prisma } from '@/prisma/site/.generated/client';
import { UserRole } from '@/prisma/site/.generated/enums';
import { TRPCThrow } from '@/trpc/server/api/site/errors';
import { logError } from '@/trpc/server/api/site/logger';
import { site } from '@/trpc/server/site';
import { tryCatch } from '../utils';

/**
 * Use Prisma's official type for transaction clients for better type safety and maintainability.
 */
type PrismaTransaction = Prisma.TransactionClient;

/**
 * Generic service handler that wraps Prisma operations with standardized error handling.
 *
 * @param operation - The async operation to execute (typically a Prisma query).
 * @param errorContext - Context information for logging (e.g., operation name, user ID).
 * @param errorMessage - User-friendly error message to throw on failure.
 * @returns The result of the operation.
 * @throws TRPCError with INTERNAL_SERVER_ERROR code on failure.
 *
 * @example
 * const post = await executeServiceOperation(
 *   () => site.post.findUnique({ where: { id } }),
 *   { operation: 'getPost', postId: id },
 *   'Failed to fetch post'
 * );
 */
export async function executeServiceOperation<T>(
	operation: () => Promise<T>,
	errorContext: Record<string, unknown>,
	errorMessage: string,
): Promise<T> {
	const { data, error } = await tryCatch(operation);

	if (error) {
		logError('Service operation failed', error, errorContext);
		TRPCThrow.internalError(errorMessage);
	}

	return data!;
}

/**
 * Service handler for operations that may return null.
 * Throws a NOT_FOUND error if the result is null or undefined.
 *
 * @param operation - The async operation to execute.
 * @param errorContext - Context information for logging.
 * @param notFoundMessage - User-friendly message for not found error.
 * @param internalErrorMessage - User-friendly message for internal errors.
 * @returns The non-null result of the operation.
 * @throws TRPCError with NOT_FOUND code if result is null/undefined.
 * @throws TRPCError with INTERNAL_SERVER_ERROR code on failure.
 *
 * @example
 * const post = await executeServiceOperationOrNotFound(
 *   () => site.post.findUnique({ where: { id } }),
 *   { operation: 'getPost', postId: id },
 *   'Post not found',
 *   'Failed to fetch post'
 * );
 */
export async function executeServiceOperationOrNotFound<T>(
	operation: () => Promise<T | null | undefined>,
	errorContext: Record<string, unknown>,
	notFoundMessage: string,
	internalErrorMessage: string,
): Promise<T> {
	const { data, error } = await tryCatch(operation);

	if (error) {
		logError('Service operation failed', error, errorContext);
		TRPCThrow.internalError(internalErrorMessage);
	}

	if (data === null || data === undefined) {
		TRPCThrow.notFound(notFoundMessage);
	}

	return data!;
}

/**
 * Service handler for transaction operations.
 * Wraps the entire transaction in error handling.
 *
 * @param transaction - The transaction callback to execute.
 * @param errorContext - Context information for logging.
 * @param errorMessage - User-friendly error message to throw on failure.
 * @returns The result of the transaction.
 * @throws TRPCError with INTERNAL_SERVER_ERROR code on failure.
 *
 * @example
 * await executeServiceTransaction(
 *   (tx) => tx.post.delete({ where: { id } }),
 *   { operation: 'deletePost', postId: id },
 *   'Failed to delete post'
 * );
 */
export async function executeServiceTransaction<T>(
	transaction: (tx: PrismaTransaction) => Promise<T>,
	errorContext: Record<string, unknown>,
	errorMessage: string,
): Promise<T> {
	const { data, error } = await tryCatch(() =>
		site.$transaction(transaction),
	);

	if (error) {
		logError('Service transaction failed', error, errorContext);
		TRPCThrow.internalError(errorMessage);
	}

	return data!;
}

/**
 * Validates that a resource belongs to the specified user, allowing for role-based overrides.
 * Throws a FORBIDDEN error if the check fails.
 *
 * @param resourceOwnerId - The ID of the resource owner.
 * @param requestingUserId - The ID of the user making the request.
 * @param requestingUserRole - The role of the user making the request.
 * @param resourceType - Type of resource for error message (e.g., 'post', 'comment').
 * @param allowedRoles - An array of roles that bypass the ownership check. Defaults to ADMIN.
 *
 * @example
 * validateResourceOwnership(post.authorId, user.id, user.role, 'post');
 */
export function validateResourceOwnership(
	resourceOwnerId: string,
	requestingUserId: string,
	requestingUserRole: string,
	resourceType: string,
	allowedRoles: UserRole[] = [UserRole.ADMIN],
): void {
	if (
		resourceOwnerId !== requestingUserId &&
		!allowedRoles.includes(requestingUserRole as UserRole)
	) {
		TRPCThrow.forbidden(
			`You are not authorized to modify this ${resourceType}. Only the author or an administrator can perform this action.`,
		);
	}
}

/**
 * Validates that a resource exists and is not soft-deleted.
 * Throws a NOT_FOUND error if the check fails.
 *
 * @param resource - The resource to validate.
 * @param resourceType - Type of resource for error message.
 * @param resourceId - ID of the resource for error message.
 * @throws TRPCError with NOT_FOUND code if resource doesn't exist or is deleted.
 *
 * @example
 * validateResourceExists(post, 'post', postId);
 */
export function validateResourceExists<
	T extends { id: IdType; deletedAt?: Date | null },
	IdType = string,
>(
	resource: T | null | undefined,
	resourceType: string,
	resourceId: IdType,
): asserts resource is T {
	if (!resource || resource.deletedAt) {
		TRPCThrow.notFound(
			`Cannot access ${resourceType}: ${
				resourceType.charAt(0).toUpperCase() + resourceType.slice(1)
			} with ID "${resourceId}" does not exist or has been deleted.`,
		);
	}
}
