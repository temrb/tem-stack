'use client';

import { cn } from '@/lib/core/utils';
import { useLayoutStore } from '@/zustand/ui/useLayoutStore';
import Header from './header';

export const getContentWidth = (menubar: boolean) =>
	menubar
		? 'hidden md:w-[calc(100%-13rem)] lg:w-[calc(100%-16rem)]'
		: 'flex w-full';

interface LayoutProps {
	children: React.ReactNode;
}

const Content = ({ children }: LayoutProps) => {
	const { menubar } = useLayoutStore();
	return (
		<div
			className={cn(
				'relative h-full flex-col bg-background md:flex',
				getContentWidth(menubar),
			)}
		>
			<Header />
			<section className='flex h-[calc(100dvh-4rem)] w-full overflow-y-auto overflow-x-hidden pt-16 scrollbar-hide md:h-full'>
				<div className='h-full w-full'>{children}</div>
			</section>
		</div>
	);
};

export default Content;
