'use client';

import { AnimatedTooltip } from '@/components/ui/animated-tooltip';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import SupportButton from '@/components/ui/button/support-button';
import Logo from '@/components/ui/logo';
import { useLayoutStore } from '@/zustand/ui/use-layout-store';

const people = [
	{
		id: 1,
		name: 'Aaron S.',
		designation: 'Perfect for my job search',
		image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80',
	},
	{
		id: 2,
		name: 'Angela M.',
		designation: 'Took my job search to the next level',
		image: 'https://images.unsplash.com/photo-1620231145627-fd3a3b321d57?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
	},
	{
		id: 3,
		name: 'Josh R.',
		designation: 'Helped me land my dream job',
		image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
	},
	{
		id: 4,
		name: 'Jon W.',
		designation: 'A must-have for job seekers',
		image: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
	},
];
const UnAuthAction = () => {
	const pathname = usePathname();

	if (pathname === '/get-started') {
		return (
			<>
				<div className='hidden h-fit w-full items-center justify-start md:flex'>
					<AnimatedTooltip items={people} />
					<div className='ml-6 whitespace-nowrap text-xs'>
						1k+ others!
					</div>
				</div>
				<div className='h-full w-full md:hidden'>
					<SignInSection />
				</div>
			</>
		);
	}

	return <SignInSection />;
};

export default UnAuthAction;

const SignInSection = () => {
	const { closeMobileMenubar } = useLayoutStore();

	return (
		<div className='flex h-full w-full flex-row items-center justify-between space-x-2'>
			<div className='flex items-center space-x-4'>
				<Button
					href='/get-started'
					text='Log In'
					aria-label='Sign In'
					size='sm'
					className='font-semibold'
					onClick={closeMobileMenubar}
			/>
			<SupportButton variant='ghost' size='icon' />
			</div>
			<Logo style='gradient' />
		</div>
	);
};
