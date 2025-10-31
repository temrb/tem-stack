'use client';

import { Button } from '@/components/ui/button';
import type { Route } from '@/lib/core/types/routes';
import { cn } from '@/lib/core/utils';
import { routes } from '@/routes';
import { useLayoutStore } from '@/zustand/ui/use-layout-store';
import { usePathname } from 'next/navigation';
import { LuMenu, LuX } from 'react-icons/lu';

const Footer = () => {
	const pathname = usePathname();
	const { menubar, toggleMenubar, closeMobileMenubar } = useLayoutStore();

	// Filter routes marked for primary navigation
	const primaryNavRoutes = routes.filter((route: Route) => route.primaryNav);

	const handleMenubarToggle = () => {
		toggleMenubar();
	};

	return (
		<nav className='border-t fixed bottom-0 z-30 flex h-16 w-full flex-row items-center justify-around divide-x divide-muted bg-background md:hidden'>
			<Button
				onClick={handleMenubarToggle}
				variant='ghost'
				className={cn(
					'flex h-full w-full rounded-none',
					menubar && 'bg-foreground/10',
				)}
				aria-label={menubar ? 'Close menu' : 'Open menu'}
			>
				{menubar ? (
					<LuX
						className='size-7 opacity-50 transition-all duration-300'
						strokeWidth={1.5}
					/>
				) : (
					<LuMenu
						className='size-7 opacity-50 transition-all duration-300'
						strokeWidth={1.5}
					/>
				)}
			</Button>
			{primaryNavRoutes.map((route) => {
				// Check if this is the current route (regardless of menubar state)
				const isCurrentRoute =
					pathname === route.displayPath ||
					(route.displayPath !== '/' &&
						pathname.startsWith(route.displayPath));

				// Visual active state (only show as active when menubar is closed)
				const isActive = !menubar && isCurrentRoute;

				const Icon = route.icon;

				return (
					<Button
						key={route.path}
						href={route.displayPath}
						icon={
							Icon ? (
								<Icon
									className={cn(
										'size-7 transition-all duration-300',
										isActive ? 'opacity-100' : 'opacity-50',
									)}
									strokeWidth={1.5}
									aria-hidden='true'
								/>
							) : undefined
						}
						className={cn(
							'flex h-full w-full items-center justify-center rounded-none transition-colors duration-300',
							isActive && 'bg-foreground/10',
						)}
						onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
							// If clicking the current route, prevent navigation and just close menubar
							if (isCurrentRoute) {
								e.preventDefault();
								closeMobileMenubar();
								return;
							}
							// Otherwise, allow navigation to proceed and close menubar
							closeMobileMenubar();
						}}
						aria-label={route.displayName}
						variant='ghost'
					/>
				);
			})}
		</nav>
	);
};

export default Footer;
