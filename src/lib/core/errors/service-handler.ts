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
 * Execute an async operation and require a non-null result, throwing NOT_FOUND if the result is missing.
 *
 * @param operation - The async operation to execute that may return `T`, `null`, or `undefined`
 * @param errorContext - Context object used when logging failures
 * @param notFoundMessage - Message returned to the client when the result is not found
 * @param internalErrorMessage - Message returned to the client when the operation fails due to an internal error
 * @returns The non-null result of the operation
 * @throws TRPCError with code `NOT_FOUND` if the operation returns `null` or `undefined`
 * @throws TRPCError with code `INTERNAL_SERVER_ERROR` if the operation throws or rejects
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
 * Ensure a resource exists and is not soft-deleted.
 *
 * Throws a NOT_FOUND TRPC error if `resource` is null/undefined or its `deletedAt` is set.
 *
 * @param resource - The resource to validate; narrowed by this assertion when present.
 * @param resourceType - Human-readable resource type used in the error message (e.g., "post").
 * @param resourceId - The identifier of the resource used in the error message.
 * @throws TRPCError with NOT_FOUND code when the resource does not exist or has been deleted.
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