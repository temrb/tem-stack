import { cn } from '@/lib/core/utils';
import type { Metadata } from 'next';
import Auth from './auth';

export const metadata: Metadata = {
	title: 'Get Started',
	description: 'Sign in or create an account to get started.',
	robots: {
		index: false,
		follow: true,
	},
};

const Landing = () => {
	return (
		<div className='relative flex h-full w-full items-center justify-center bg-background'>
			<div
				className={cn(
					'absolute inset-0',
					'[background-size:20px_20px]',
					'[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]',
					'dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]',
				)}
			/>
			<div className='pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_5%,black)]'></div>
			<div className='relative mx-auto flex h-full w-full max-w-lg flex-col items-center justify-start space-y-14 px-4 pt-4 sm:pt-16 lg:max-w-2xl'>
				<Auth />
				{/* <LandingInteraction /> */}
			</div>
		</div>
	);
};

export default Landing;
