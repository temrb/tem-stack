import {
	executeServiceOperation,
	executeServiceOperationOrNotFound,
} from '@/lib/core/errors/service-handler';
import { TRPCThrow } from '@/trpc/server/api/site/errors';
import { site } from '@/trpc/server/site';
import type {
	DeleteAccountFormInput,
	UpdateAliasFormInput,
} from '../../lib/validation/user.z';

export const updateUserAlias = async (
	userId: string,
	input: UpdateAliasFormInput,
) => {
	const { alias } = input;

	const existingUser = await executeServiceOperation(
		() =>
			site.user.findFirst({
				where: {
					alias,
					NOT: {
						id: userId,
					},
				},
			}),
		{ operation: 'updateUserAlias:checkExisting', userId, alias },
		'An unexpected error occurred while checking alias availability. Please try again.',
	);

	if (existingUser) {
		TRPCThrow.conflict(
			'This alias is already taken. Please choose another one.',
		);
	}

	// Update the user's alias
	const updatedUser = await executeServiceOperation(
		() =>
			site.user.update({
				where: { id: userId },
				data: { alias },
				select: { alias: true },
			}),
		{ operation: 'updateUserAlias:update', userId, alias },
		'An unexpected error occurred while updating your alias. Please try again.',
	);

	return {
		success: true,
		message: 'Your alias has been successfully updated.',
		alias: updatedUser.alias,
	};
};

export const checkAlias = async (alias: string, userId: string) => {
	// Early return for short aliases
	if (alias.length < 5) {
		return { available: false, message: 'Alias is too short.' };
	}

	// Check if alias is taken by another user
	const user = await executeServiceOperation(
		() =>
			site.user.findFirst({
				where: {
					alias: alias,
					id: {
						not: userId,
					},
				},
			}),
		{ operation: 'checkAlias', alias, userId },
		'An unexpected error occurred while checking alias availability.',
	);

	if (user) {
		return { available: false, message: 'Alias is already taken.' };
	}

	return { available: true, message: 'Alias is available.' };
};

export const deleteUserAccount = async (
	userId: string,
	input: DeleteAccountFormInput,
) => {
	// First verify the user exists and email matches
	const user = await executeServiceOperationOrNotFound(
		() =>
			site.user.findUnique({
				where: { id: userId },
				select: { email: true },
			}),
		{ operation: 'deleteUserAccount:findUser', userId },
		'Cannot delete account: User account not found. Please log out and log back in.',
		'An unexpected error occurred while verifying your account. Please try again or contact support if the issue persists.',
	);

	// Verify email matches (case-insensitive)
	if (user.email?.toLowerCase() !== input.email.toLowerCase()) {
		TRPCThrow.badRequest(
			'The email you entered does not match your account email.',
		);
	}

	// Delete the account (confirmation text is already validated by Zod schema)
	await executeServiceOperation(
		() =>
			site.user.delete({
				where: { id: userId },
			}),
		{ operation: 'deleteUserAccount:delete', userId },
		'An unexpected error occurred while deleting your account. Please try again or contact support if the issue persists.',
	);

	return {
		success: true,
		message: 'Your account has been successfully deleted',
	};
};

export const checkUserOnboarding = async (userId: string) => {
	const user = await executeServiceOperation(
		() =>
			site.user.findUnique({
				where: {
					id: userId,
				},
				select: {
					onboardingCompleted: true,
				},
			}),
		{ operation: 'checkUserOnboarding', userId },
		'An unexpected error occurred while checking your onboarding status. Please refresh the page and try again.',
	);

	if (!user) {
		// User not found - return false rather than throwing error for onboarding check
		return {
			success: true,
			isComplete: false,
		};
	}

	return {
		success: true,
		isComplete: user.onboardingCompleted ?? false,
	};
};

export const updateUserOnboarding = async (
	userId: string,
	complete: boolean,
) => {
	const user = await executeServiceOperationOrNotFound(
		() =>
			site.user.update({
				where: {
					id: userId,
				},
				data: {
					onboardingCompleted: complete,
					updatedAt: new Date(),
				},
				select: {
					onboardingCompleted: true,
				},
			}),
		{ operation: 'updateUserOnboarding', userId, complete },
		'Cannot update onboarding: User account not found. Please log out and log back in.',
		'An unexpected error occurred while updating your onboarding status. Please try again.',
	);

	return {
		success: true,
		complete: user.onboardingCompleted,
	};
};
