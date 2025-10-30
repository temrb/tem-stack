'use client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/core/utils';
import { createRouteMatcher } from '@/lib/proxy/utils/route-matcher';
import { routes } from '@/routes';
import { useLayoutStore } from '@/zustand/ui/useLayoutStore';
import { usePathname } from 'next/navigation';
import { LuPanelLeftOpen } from 'react-icons/lu';
import HeaderAction from './header-action';

const Header = () => {
	const { menubar, toggleMenubar } = useLayoutStore();
	const currentPath = usePathname();

	// Find the current route
	const currentRoute = routes.find((route) => {
		if (route.path === '/') {
			return route.path === currentPath;
		}
		const routeRegExp = createRouteMatcher(route.path);
		return routeRegExp.test(currentPath);
	});

	const defaultStyles =
		'absolute top-0 z-20 flex h-16 w-full flex-row items-center justify-between bg-card p-4 bg-background border-b border-border';

	return (
		<header className={cn(defaultStyles)}>
			<div
				className={cn(
					'flex w-auto min-w-0 max-w-[60%] items-center sm:max-w-[50%]',
					!menubar && 'md:space-x-2',
				)}
			>
				<Button
					className={
						menubar ? 'hidden' : 'hidden flex-shrink-0 md:flex'
					}
					variant='ghost'
					size='icon'
					onClick={() => toggleMenubar()}
					disabled={menubar}
					aria-label='Open menu'
					icon={<LuPanelLeftOpen className='size-4' />}
				/>
				{currentRoute && (
					<h1 className='truncate pr-2 text-lg font-medium md:text-xl'>
						{currentRoute.displayName}
					</h1>
				)}
			</div>
			<HeaderAction />
		</header>
	);
};

export default Header;
