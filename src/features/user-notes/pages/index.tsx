import { api } from '@/trpc/server';
import { getSession } from '@/lib/auth';
import UserNotesForm from '@/features/user-notes/components/user-notes-form';
import { TRPCError } from '@trpc/server';

const UserNotesPage = async () => {
	const session = await getSession();

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
		const result = await api.userNotes.main.getNote();
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
