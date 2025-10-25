import UserNotesPage from '@/features/user-notes/pages';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'My Notes',
	description: 'Write and save your private notes.',
	robots: {
		index: false,
		follow: true,
	},
};

const Page = () => {
	return <UserNotesPage />;
};

export default Page;
