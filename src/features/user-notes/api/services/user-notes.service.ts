import tryCatch from '@/lib/core/utils/try-catch';
import { TRPCThrow } from '@/trpc/server/api/site/errors';
import { site } from '@/trpc/server/site';
import type { UpdateNoteInput } from '../../lib/validation/user-notes.z';

/**
 * User Notes Service
 *
 * Contains business logic for the user-notes feature.
 * Separates database operations and business rules from tRPC procedures.
 */

/**
 * Fetches the note for a specific user
 */
export const getNote = async (userId: string) => {
	const { data, error } = await tryCatch(
		site.user.findUnique({
			where: { id: userId },
			select: { note: true },
		})
	);

	if (error) {
		console.error(
			'getNote: An unexpected error occurred while fetching user note',
			error,
			{ userId }
		);
		TRPCThrow.internalError(
			'An unexpected error occurred while fetching your note. Please try again.'
		);
	}

	if (!data) {
		TRPCThrow.notFound('User not found.');
	}

	return {
		success: true,
		note: data!.note ?? '',
	};
};

/**
 * Updates the note for a specific user
 */
export const updateNote = async (userId: string, input: UpdateNoteInput) => {
	const { note } = input;

	const { data, error } = await tryCatch(
		site.user.update({
			where: { id: userId },
			data: { note },
			select: { note: true },
		})
	);

	if (error) {
		console.error(
			'updateNote: An unexpected error occurred while updating user note',
			error,
			{ userId }
		);
		TRPCThrow.internalError(
			'An unexpected error occurred while updating your note. Please try again.'
		);
	}

	if (!data) {
		TRPCThrow.notFound('User not found.');
	}

	return {
		success: true,
		message: 'Your note has been successfully saved.',
		note: data!.note,
	};
};
