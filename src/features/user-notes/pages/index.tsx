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
import { UpdateNoteSchema } from '@/features/user-notes/lib/validation/user-notes.z';
import { createFormErrorHandler } from '@/hooks/useHandleFormError';
import {
	handleTRPCError,
	handleTRPCSuccess,
} from '@/lib/core/errors/error-handler';
import tryCatch from '@/lib/core/utils/try-catch';
import { api } from '@/trpc/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

/**
 * User Notes Page
 *
 * Main page component for the user-notes feature.
 * Allows users to write, save, and view their private note.
 */
const UserNotesPage = () => {
	const { data: noteData, isLoading: isLoadingNote } =
		api.userNotes.main.getNote.useQuery(undefined, {
			refetchOnWindowFocus: false,
		});

	const form = useForm<z.infer<typeof UpdateNoteSchema>>({
		resolver: zodResolver(UpdateNoteSchema),
		defaultValues: {
			note: '',
		},
		mode: 'onSubmit',
	});

	// Update form when note data is loaded
	useEffect(() => {
		if (noteData?.note !== undefined) {
			form.reset({ note: noteData.note });
		}
	}, [noteData, form]);

	const updateNoteMutation = api.userNotes.main.updateNote.useMutation();

	const onSubmit = useCallback(
		async (values: z.infer<typeof UpdateNoteSchema>) => {
			const { data: result, error } = await tryCatch(
				updateNoteMutation.mutateAsync(values),
			);

			if (error) {
				handleTRPCError(error, 'Failed to save note');
				return;
			}

			if (result) {
				handleTRPCSuccess('Note saved successfully!', result);
			}
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
		<div className='mx-auto max-w-4xl space-y-6 p-6'>
			<div className='space-y-2'>
				<h1 className='text-3xl font-bold'>My Notes</h1>
				<p className='text-sm text-muted-foreground'>
					Write and save your private notes. Maximum 5000 characters.
				</p>
			</div>

			{isLoadingNote ? (
				<div className='flex items-center justify-center py-12'>
					<p className='text-muted-foreground'>
						Loading your note...
					</p>
				</div>
			) : (
				<Form {...form}>
					<form
						onSubmit={(e) => e.preventDefault()}
						className='space-y-4'
					>
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
			)}
		</div>
	);
};

export default UserNotesPage;
