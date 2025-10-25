import { createTRPCRouter, protectedProcedure } from '@/trpc/server/api/site/trpc';
import { UpdateNoteSchema } from '../lib/validation/user-notes.z';
import * as userNotesService from './services/user-notes.service';

/**
 * User Notes Router
 *
 * Defines tRPC procedures for the user-notes feature.
 * Business logic should be implemented in the service layer.
 */
export const userNotesRouter = createTRPCRouter({
	/**
	 * Get the current user's note
	 */
	getNote: protectedProcedure.query(async ({ ctx }) => {
		const result = await userNotesService.getNote(ctx.session.user.id);
		return result;
	}),

	/**
	 * Update the current user's note
	 */
	updateNote: protectedProcedure
		.input(UpdateNoteSchema)
		.mutation(async ({ input, ctx }) => {
			const result = await userNotesService.updateNote(
				ctx.session.user.id,
				input
			);
			return result;
		}),
});
