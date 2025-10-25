import tryCatch from '@/lib/core/utils/try-catch';
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

	// Check if alias is already taken by another user
	const { data: existingUser, error: findError } = await tryCatch(
		site.user.findFirst({
			where: {
				alias,
				NOT: {
					id: userId,
				},
			},
		}),
	);

	if (findError) {
		console.error(
			'updateUserAlias: A non-TRPC, unexpected error occurred while checking for existing alias',
			findError,
			{ userId, alias },
		);
		TRPCThrow.internalError(
			'An unexpected error occurred. Please try again.',
		);
	}

	if (existingUser) {
		TRPCThrow.conflict(
			'This alias is already taken. Please choose another one.',
		);
	}

	// Update the user's alias
	const { data, error } = await tryCatch(
		site.user.update({
			where: { id: userId },
			data: { alias },
			select: { alias: true },
		}),
	);

	if (error) {
		console.error(
			'updateUserAlias: A non-TRPC, unexpected error occurred',
			error,
			{ userId, alias },
		);
		TRPCThrow.internalError(
			'An unexpected error occurred while updating your alias. Please try again.',
		);
	}

	return {
		success: true,
		message: 'Your alias has been successfully updated.',
		alias: data!.alias,
	};
};

export const checkAlias = async (alias: string, userId: string) => {
	// Early return for short aliases
	if (alias.length < 5) {
		return { available: false, message: 'Alias is too short.' };
	}

	// Check if alias is taken by another user
	const { data: user, error } = await tryCatch(
		site.user.findFirst({
			where: {
				alias: alias,
				id: {
					not: userId,
				},
			},
		}),
	);

	if (error) {
		console.error(
			'checkAliasAvailability: A non-TRPC, unexpected error occurred',
			error,
			{ alias },
		);
		TRPCThrow.internalError(
			'An unexpected error occurred while checking alias availability.',
		);
	}

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
	const { data: user, error: findError } = await tryCatch(
		site.user.findUnique({
			where: { id: userId },
			select: { email: true },
		}),
	);

	if (findError) {
		console.error(
			'deleteUserAccount: A non-TRPC, unexpected error occurred while finding user',
			findError,
			{ userId },
		);
		TRPCThrow.internalError(
			'An unexpected error occurred while deleting your account. Please try again or contact support if the issue persists.',
		);
	}

	if (!user) {
		TRPCThrow.notFound(
			'Cannot delete account: User account not found. Please log out and log back in.',
		);
	}

	// Verify email matches (case-insensitive)
	if (user?.email?.toLowerCase() !== input.email.toLowerCase()) {
		TRPCThrow.badRequest(
			'The email you entered does not match your account email.',
		);
	}

	// Delete the account (confirmation text is already validated by Zod schema)
	const { error } = await tryCatch(
		site.user.delete({
			where: { id: userId },
		}),
	);

	if (error) {
		console.error(
			'deleteUserAccount: A non-TRPC, unexpected error occurred',
			error,
			{ userId },
		);
		TRPCThrow.internalError(
			'An unexpected error occurred while deleting your account. Please try again or contact support if the issue persists.',
		);
	}

	return {
		success: true,
		message: 'Your account has been successfully deleted',
	};
};

export const checkUserOnboarding = async (userId: string) => {
	const { data, error } = await tryCatch(
		site.user.findUnique({
			where: {
				id: userId,
			},
			select: {
				onboardingCompleted: true,
			},
		}),
	);

	if (error) {
		console.error(
			'checkUserOnboarding: A non-TRPC, unexpected error occurred',
			error,
			{ userId },
		);
		TRPCThrow.internalError(
			'An unexpected error occurred while checking your onboarding status. Please refresh the page and try again.',
		);
	}

	if (!data) {
		// User not found - return false rather than throwing error for onboarding check
		return {
			success: true,
			isComplete: false,
		};
	}

	return {
		success: true,
		isComplete: data.onboardingCompleted ?? false,
	};
};

export const updateUserOnboarding = async (
	userId: string,
	complete: boolean,
) => {
	const { data, error } = await tryCatch(
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
	);

	if (error) {
		console.error(
			'updateUserOnboarding: A non-TRPC, unexpected error occurred',
			error,
			{ userId, complete },
		);
		TRPCThrow.internalError(
			'An unexpected error occurred while updating your onboarding status. Please try again.',
		);
	}

	if (!data) {
		TRPCThrow.notFound(
			'Cannot update onboarding: User account not found. Please log out and log back in.',
		);
	}

	// TypeScript doesn't recognize TRPCThrow as never-returning above
	return {
		success: true,
		complete: data!.onboardingCompleted,
	};
};
