import * as z from 'zod';

/**
 * User Notes Validation Schemas
 *
 * Zod schemas for runtime validation of user-notes feature data.
 * These are used in tRPC procedures and forms.
 */

/**
 * Schema for updating a user's note
 */
export const UpdateNoteSchema = z.object({
	note: z
		.string()
		.max(5000, 'Note must be less than 5000 characters')
		.trim(),
});

// Type exports
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;
