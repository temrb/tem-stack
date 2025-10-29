**High-Level Plan**

The refactoring strategy involves splitting the `user-notes` feature into a React Server Component (RSC) for initial data fetching and a Client Component for interactive form handling and optimistic updates. The existing `src/features/user-notes/pages/index.tsx` will be converted into an `async` Server Component. This Server Component will fetch the user's note data directly on the server using tRPC's server-side query capabilities. The fetched `initialNote` content will then be passed as a prop to a newly created Client Component, `src/features/user-notes/components/user-notes-form.tsx`. This Client Component, marked with `'use client'`, will manage the form state, handle user input, and perform the note update mutation. Optimistic updates will be implemented for the `updateNote` mutation, allowing the UI to reflect changes instantly while the actual server update is processed in the background. Rollback mechanisms will be in place for failed mutations, and the cache will be invalidated upon successful completion to ensure data freshness.

**New File Creation**

- `src/features/user-notes/components/user-notes-form.tsx`

**File-by-File Implementation**

### src/features/user-notes/pages/index.tsx

- **Key Changes**:
    - Removed `'use client'` directive to make this an `async` Server Component.
    - Added `getServerAuthSession` to fetch the user's session on the server.
    - Implemented a check for unauthenticated users, rendering a specific message if no session is found.
    - Used `api.userNotes.main.getNote.query()` directly on the server to fetch the initial note content.
    - Implemented basic error handling for the server-side data fetch.
    - Removed all client-side form logic, `useEffect` hooks, and mutation calls.
    - Rendered the new `UserNotesForm` Client Component, passing the `initialNote` content as a prop.

```tsx
import { api } from '@/trpc/server';
import { getServerAuthSession } from '@/lib/server/auth';
import UserNotesForm from '@/features/user-notes/components/user-notes-form';
import { TRPCError } from '@trpc/server';

const UserNotesPage = async () => {
	const session = await getServerAuthSession();

	if (!session?.user) {
		return (
			<div className='mx-auto max-w-4xl space-y-6 p-6'>
				<div className='space-y-2'>
					<h1 className='text-3xl font-bold'>My Notes</h1>
					<p className='text-muted-foreground text-sm'>
						Write and save your private notes. Maximum 5000
						characters.
					</p>
				</div>
				<div className='flex items-center justify-center py-12'>
					<p className='text-muted-foreground'>
						Please sign in to view and manage your notes.
					</p>
				</div>
			</div>
		);
	}

	let initialNoteContent = '';
	let fetchError: string | null = null;

	try {
		// Directly call the tRPC query on the server for initial data fetching.
		// The `api` import from '@/trpc/server' ensures this runs in an RSC context
		// and correctly infers the session for protected procedures.
		const result = await api.userNotes.main.getNote.query();
		initialNoteContent = result.note;
	} catch (error) {
		if (error instanceof TRPCError) {
			fetchError = error.message;
		} else {
			console.error('Failed to fetch user note on server:', error);
			fetchError = 'Failed to load your note due to an unexpected error.';
		}
	}

	return (
		<div className='mx-auto max-w-4xl space-y-6 p-6'>
			<div className='space-y-2'>
				<h1 className='text-3xl font-bold'>My Notes</h1>
				<p className='text-muted-foreground text-sm'>
					Write and save your private notes. Maximum 5000 characters.
				</p>
			</div>
			{fetchError ? (
				<div className='flex items-center justify-center py-12'>
					<p className='text-destructive'>{fetchError}</p>
				</div>
			) : (
				// Render the Client Component, passing the server-fetched data as props.
				<UserNotesForm initialNote={initialNoteContent} />
			)}
		</div>
	);
};

export default UserNotesPage;
```

### src/features/user-notes/components/user-notes-form.tsx

- **Key Changes**:
    - Created as a new Client Component, explicitly marked with `'use client'`.
    - Receives `initialNote` content as a prop from the Server Component.
    - Initializes `react-hook-form`'s `defaultValues` with `initialNote`.
    - Implemented an `useEffect` to reset the form if `initialNote` prop changes (useful if the parent component ever changes the `initialNote` value for some reason, though less likely in this specific context).
    - Relocated the `api.userNotes.main.updateNote.useMutation` hook.
    - Implemented optimistic updates:
        - `onMutate`: Cancels pending `getNote` refetches, snapshots the current cache data, and then optimistically updates the `getNote` cache with the new note content.
        - `onError`: Rolls back the cache to the `previousNoteData` snapshot if the mutation fails and calls the existing error handler.
        - `onSuccess`: Calls the existing success handler.
        - `onSettled`: Invalidates the `getNote` query to ensure data consistency with the server after the mutation finishes (success or failure).
    - All form rendering, input handling, and button interactions are contained within this component.

```tsx
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
```
