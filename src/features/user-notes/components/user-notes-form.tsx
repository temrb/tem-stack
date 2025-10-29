'use client';

import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
	UpdateNoteSchema,
	type UpdateNoteInput,
} from '@/features/user-notes/lib/validation/user-notes.z';
import { createFormErrorHandler } from '@/hooks/useHandleFormError';
import {
	handleTRPCError,
	handleTRPCSuccess,
} from '@/lib/core/errors/error-handler';
import { api } from '@/trpc/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

interface UserNotesFormProps {
	initialNote: string;
}

const UserNotesForm = ({ initialNote }: UserNotesFormProps) => {
	const utils = api.useUtils(); // Access tRPC client utilities for cache management

	const form = useForm<z.infer<typeof UpdateNoteSchema>>({
		resolver: zodResolver(UpdateNoteSchema),
		defaultValues: {
			note: initialNote, // Initialize form with the data fetched by the Server Component
		},
		mode: 'onSubmit',
	});

	// Effect to reset form values if the initialNote prop changes.
	// This ensures the form is synchronized if the parent (Server Component)
	// were to provide a different note (e.g., if navigating between user notes).
	useEffect(() => {
		if (initialNote !== undefined) {
			form.reset({ note: initialNote });
		}
	}, [initialNote, form]);

	const updateNoteMutation = api.userNotes.main.updateNote.useMutation({
		onMutate: async (newNoteInput: UpdateNoteInput) => {
			// 1. Cancel any outgoing refetches for the 'getNote' query to prevent race conditions.
			await utils.userNotes.main.getNote.cancel();

			// 2. Snapshot the current data in the cache before making the optimistic update.
			// This allows us to roll back if the mutation fails.
			const previousNoteData = utils.userNotes.main.getNote.getData();

			// 3. Optimistically update the cache with the new note content.
			// The `undefined` argument is used because the `getNote` query has no input.
			utils.userNotes.main.getNote.setData(undefined, {
				success: true,
				note: newNoteInput.note,
			});

			// Return the snapshot to the context, which will be available in onError/onSuccess/onSettled.
			return { previousNoteData };
		},
		onError: (error, _variables, context) => {
			// If the mutation fails, roll back the cache to the previous state using the snapshot.
			if (context?.previousNoteData) {
				utils.userNotes.main.getNote.setData(
					undefined,
					context.previousNoteData,
				);
			}
			// Call the existing error handler to display a toast or other error feedback.
			handleTRPCError(error, 'Failed to save note');
		},
		onSuccess: (data) => {
			// Call the existing success handler to display a toast or other success feedback.
			handleTRPCSuccess('Note saved successfully!', data);
		},
		onSettled: () => {
			// After the mutation has settled (either success or error),
			// invalidate the 'getNote' query. This forces a refetch from the server
			// to ensure the client's cache is fully synchronized with the actual server state.
			void utils.userNotes.main.getNote.invalidate();
		},
	});

	const onSubmit = useCallback(
		(values: z.infer<typeof UpdateNoteSchema>) => {
			// Trigger the mutation. Optimistic updates are handled by the `useMutation` callbacks.
			updateNoteMutation.mutate(values);
		},
		[updateNoteMutation],
	);

	const formErrorHandler =
		createFormErrorHandler<z.infer<typeof UpdateNoteSchema>>();

	const handleSubmit = () => {
		void form.handleSubmit(onSubmit, formErrorHandler)();
	};

	const isLoading = updateNoteMutation.isPending;

	return (
		<Form {...form}>
			<form onSubmit={(e) => e.preventDefault()} className='space-y-4'>
				<FormField
					control={form.control}
					name='note'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Textarea
									{...field}
									placeholder='Start writing your note here...'
									className='min-h-[400px] resize-y'
									disabled={isLoading}
									aria-label='Note content'
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className='flex justify-end'>
					<Button
						type='button'
						onClick={handleSubmit}
						loading={isLoading}
						disabled={isLoading}
						aria-label='Save note'
					>
						Save Note
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default UserNotesForm;
