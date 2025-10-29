import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Track',
	description: 'Track your activities and monitor your progress.',
	robots: {
		index: false,
		follow: true,
	},
};

const Page = () => {
	return <div>Page</div>;
};

export default Page;
