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
	return (
		<section className='p-4'>
			<h1 className='text-2xl font-bold'>Welcome to the Home Page</h1>
			<p>This is the main content area of the home page.</p>
		</section>
	);
};

export default Page;
