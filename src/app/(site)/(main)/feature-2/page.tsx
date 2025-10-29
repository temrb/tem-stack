import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Feature Two',
	description: 'Discover the power of Feature Two and how it can help you.',
	robots: {
		index: true,
		follow: true,
	},
};

const Page = () => {
	return <div>Page</div>;
};

export default Page;
