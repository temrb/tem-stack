'use client';

import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks';
import type { Route } from '@/lib/core/types/routes';
import { cn } from '@/lib/core/utils';
import { useLayoutStore } from '@/zustand/ui/useLayoutStore';
import { usePathname } from 'next/navigation';

const MenubarItem = (props: Route) => {
	const {
		path,
		displayName,
		category,
		displayPath,
		type,
		status,
		onboardingCompleteRequired,
		icon: Icon,
	} = props;
	const currentPath = usePathname();
	const { setMenubar } = useLayoutStore();
	const { isMobile } = useMediaQuery();

	const navigationPath = displayPath || path;

	const isActive =
		currentPath === navigationPath ||
		(navigationPath !== '/' && currentPath.startsWith(navigationPath));

	const handleMenubarClose = () => {
		if (isMobile) {
			setMenubar(false);
		}
	};

	const defaultStyles =
		'flex w-full items-center justify-start md:px-3 md:py-1 p-4 text-sm font-medium text-muted-foreground md:rounded-sm';

	if (status) {
		return (
			<div
				className={cn(defaultStyles, 'cursor-default opacity-60')}
				aria-label={`${displayName} - ${status}`}
			>
				{Icon && (
					<Icon
						className='mr-2 h-4 w-4 flex-shrink-0'
						aria-hidden='true'
					/>
				)}
				<p className='text-overflow w-full truncate font-mono italic'>
					{status === 'soon' && 'Soon'}
					{status === 'next' && 'Next Update'}
				</p>
			</div>
		);
	}

	return (
		<Button
			variant='ghost'
			className={cn(
				defaultStyles,
				'gap-3',
				isActive &&
					'bg-foreground text-background md:pointer-events-none',
			)}
			onClick={handleMenubarClose}
			aria-label={displayName}
			href={navigationPath}
			icon={
				Icon && (
					<Icon
						className='h-4 w-4 flex-shrink-0'
						aria-hidden='true'
					/>
				)
			}
			iconPosition='left'
			disableWhilePending
		>
			{displayName}
		</Button>
	);
};

export default MenubarItem;
