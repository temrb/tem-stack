import {
	executeServiceOperation,
	executeServiceOperationOrNotFound,
} from '@/lib/core/errors/service-handler';
import { site } from '@/trpc/server/site';
import type { UpdateNoteInput } from '../../lib/validation/user-notes.z';

export const getNote = async (userId: string) => {
	const user = await executeServiceOperationOrNotFound(
		() =>
			site.user.findUnique({
				where: { id: userId },
				select: { note: true },
			}),
		{ operation: 'getNote', userId },
		'User not found.',
		'An unexpected error occurred while fetching your note. Please try again.',
	);

	return {
		success: true,
		note: user.note ?? '',
	};
};

/**
 * Updates the note for a specific user
 */
export const updateNote = async (userId: string, input: UpdateNoteInput) => {
	const { note } = input;

	// First check if user exists and get current note
	const user = await executeServiceOperationOrNotFound(
		() =>
			site.user.findUnique({
				where: { id: userId },
				select: { note: true },
			}),
		{ operation: 'updateNote:findUser', userId },
		'User not found.',
		'An unexpected error occurred while fetching your note. Please try again.',
	);

	// Early return if note hasn't changed
	if (user.note === note) {
		return {
			success: true,
			message: 'Your note is already up to date.',
			note: user.note,
		};
	}

	// Update the note
	const updatedUser = await executeServiceOperation(
		() =>
			site.user.update({
				where: { id: userId },
				data: { note },
				select: { note: true },
			}),
		{ operation: 'updateNote:update', userId },
		'An unexpected error occurred while updating your note. Please try again.',
	);

	return {
		success: true,
		message: 'Your note has been successfully saved.',
		note: updatedUser.note,
	};
};
