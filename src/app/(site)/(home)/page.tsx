import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Home',
	description: 'Home page of the site.',
	robots: {
		index: true,
		follow: true,
	},
};

const Page = () => {
	return <div>Page</div>;
};

export default Page;
