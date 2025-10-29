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
import { LuSave } from 'react-icons/lu';
import type { z } from 'zod';

interface UserNotesFormProps {
	initialNote: string;
}

const UserNotesForm = ({ initialNote }: UserNotesFormProps) => {
	const utils = api.useUtils();
	const form = useForm<z.infer<typeof UpdateNoteSchema>>({
		resolver: zodResolver(UpdateNoteSchema),
		defaultValues: {
			note: initialNote,
		},
		mode: 'onSubmit',
	});

	useEffect(() => {
		if (initialNote !== undefined) {
			form.reset({ note: initialNote });
		}
	}, [initialNote, form]);

	const updateNoteMutation = api.userNotes.main.updateNote.useMutation({
		onMutate: async (newNoteInput: UpdateNoteInput) => {
			await utils.userNotes.main.getNote.cancel();
			const previousNoteData = utils.userNotes.main.getNote.getData();
			utils.userNotes.main.getNote.setData(undefined, {
				success: true,
				note: newNoteInput.note,
			});
			return { previousNoteData };
		},
		onError: (error, _variables, context) => {
			if (context?.previousNoteData) {
				utils.userNotes.main.getNote.setData(
					undefined,
					context.previousNoteData,
				);
			}
			handleTRPCError(error, 'Failed to save note');
		},
		onSuccess: (data) => {
			handleTRPCSuccess('Note saved successfully!', data);
			form.reset({ note: data.note ?? '' });
		},
		onSettled: () => {
			void utils.userNotes.main.getNote.invalidate();
		},
	});

	const onSubmit = useCallback(
		(values: z.infer<typeof UpdateNoteSchema>) => {
			updateNoteMutation.mutate(values);
		},
		[updateNoteMutation],
	);

	const formErrorHandler =
		createFormErrorHandler<z.infer<typeof UpdateNoteSchema>>();
	const isLoading = updateNoteMutation.isPending;
	const { isDirty } = form.formState;

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit, formErrorHandler)}
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
									maxLength={5000}
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
						type='submit'
						loading={isLoading}
						disabled={isLoading || !isDirty}
						aria-label='Save note'
						icon={<LuSave />}
						text='Save Note'
					/>
				</div>
			</form>
		</Form>
	);
};

export default UserNotesForm;
