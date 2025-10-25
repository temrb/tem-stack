import GeneralSettings from '@/features/settings/pages/general';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'General Settings',
	description:
		'Manage your general settings, theme preferences, and account info.',
	robots: {
		index: false,
		follow: true,
	},
};

const Page = () => {
	return <GeneralSettings />;
};

export default Page;
