'use client';
import SuspenseWrapper from '@/components/suspense-wrapper';
import { Button } from '@/components/ui/button';
import type { Route } from '@/lib/core/types/routes';
import { cn } from '@/lib/core/utils';
import { routes } from '@/routes';
import { useLayoutStore } from '@/zustand/ui/useLayoutStore';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth/auth-client';
import { usePathname } from 'next/navigation';
import { lazy, useCallback } from 'react';
import { LuPanelLeftClose, LuX } from 'react-icons/lu';
import MenubarItem from './menubar-item';

const AuthAction = lazy(() => import('./auth-action'));
const UnAuthAction = lazy(() => import('./unauth-action'));

const menubarVariants = {
	hidden: {
		opacity: '0%',
		transition: {
			duration: 0.3,
		},
	},
	visible: {
		opacity: '100%',
		transition: {
			duration: 0.3,
			staggerChildren: 0.05,
			delayChildren: 0.1,
		},
	},
	exit: {
		opacity: '0%',
		transition: {
			duration: 0.3,
		},
	},
};

const menuItemContainerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.03,
		},
	},
};

const menuItemVariants = {
	hidden: {
		opacity: 0,
	},
	visible: {
		opacity: 1,
	},
};

const Menubar = () => {
	const { menubar, setMenubar } = useLayoutStore();
	const currentPath = usePathname();
	const { data: session, isPending } = useSession();

	const features = routes.filter((route: Route) => {
		if (route.category !== 'feature') return false;
		return route.type !== 'admin';
	});

	const primaryNavRoutes = routes.filter((route: Route) => route.primaryNav);

	// Render the correct AuthAction component based on session status
	const renderAuthAction = useCallback(() => {
		return (
			<SuspenseWrapper>
				{!isPending && session ? (
					<AuthAction />
				) : (
					<UnAuthAction />
				)}
			</SuspenseWrapper>
		);
	}, [session, isPending]);

	return (
		<motion.aside
			initial='hidden'
			animate='visible'
			exit='exit'
			variants={menubarVariants}
			className='flex h-full w-full flex-col-reverse md:border-r md:w-52 md:flex-col lg:w-64'
		>
			{/* menubar header */}
			<div className='border-b z-30 flex h-16 w-full items-center justify-between border-border px-4'>
				<Button
					variant='ghost'
					size='icon'
					onClick={() => setMenubar(!menubar)}
					aria-label='Close menu'
				>
					<LuX className='flex size-4 md:hidden' />
					<LuPanelLeftClose className='hidden size-4 md:flex' />
				</Button>

				<div className='flex flex-row items-center space-x-1'>
					{primaryNavRoutes.map((route: Route) => {
						const isActive =
							currentPath === route.displayPath ||
							(route.displayPath !== '/' &&
								currentPath.startsWith(route.displayPath));
						const Icon = route.icon;

						return (
							<Button
								key={route.path}
								href={isActive ? undefined : route.displayPath}
								variant={isActive ? 'secondary' : 'ghost'}
								size='icon'
								className={cn(
									currentPath.startsWith(route.displayPath) &&
										route.displayPath !== '/' &&
										'hidden md:flex',
									isActive &&
										'pointer-events-none opacity-50',
								)}
								disabled={isActive}
								icon={
									Icon ? (
										<Icon
											className='size-4'
											aria-hidden='true'
										/>
									) : undefined
								}
								aria-label={route.displayName}
							/>
						);
					})}
				</div>
			</div>

			{/* menubar body */}
			<div className='flex h-[calc(100dvh-8rem)] w-full flex-col overflow-y-auto overflow-x-hidden bg-background p-4 scrollbar-hide'>
				{/* <div className='sticky top-0 z-10 w-full bg-background px-4 md:px-0'>
					<Input
						autoFocus={false}
						spellCheck={false}
						className='!rounded-none !border-l-0 !border-r-0 !border-t-0 !p-0 !ring-0 !ring-offset-0 md:text-sm'
						placeholder='Find something...'
						aria-label='Search items'
					/>
				</div> */}

				<motion.div
					className='flex-1 space-y-2'
					variants={menuItemContainerVariants}
					initial='hidden'
					animate='visible'
				>
					{features.map((route: Route) => (
						<motion.div
							key={route.path}
							variants={menuItemVariants}
						>
							<MenubarItem {...route} />
						</motion.div>
					))}
				</motion.div>
			</div>

			{/* menubar footer */}
			<div className='border-b flex h-16 items-center justify-between px-4 md:border-t'>
				{renderAuthAction()}
			</div>
		</motion.aside>
	);
};

export default Menubar;
