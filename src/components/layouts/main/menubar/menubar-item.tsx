// src/components/layouts/main/menubar/menubar-item.tsx
'use client';
import { Button } from '@/components/ui/button';
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
	const { closeMobileMenubar } = useLayoutStore();

	const navigationPath = displayPath || path;
	const isActive =
		currentPath === navigationPath ||
		(navigationPath !== '/' &&
			currentPath.startsWith(navigationPath + '/'));

	const baseStyles =
		'flex w-full items-center justify-start gap-3 md:px-3 md:py-1 p-4 text-sm font-medium md:rounded-sm';

	if (status) {
		return (
			<div
				className={cn(baseStyles)}
				aria-label={`${displayName} - ${status}`}
			>
				{Icon && (
					<Icon
						className='h-4 w-4 flex-shrink-0'
						aria-hidden='true'
					/>
				)}
				<p className='w-full truncate font-mono italic'>
					{status === 'soon' && 'Soon'}
					{status === 'next' && 'Next Update'}
				</p>
			</div>
		);
	}

	return (
		<Button
			variant={isActive ? 'default' : 'ghost'}
			href={isActive ? undefined : navigationPath}
			onClick={closeMobileMenubar}
			aria-label={displayName}
			aria-current={isActive ? 'page' : undefined}
			// disabled={isActive}
			className={cn(
				baseStyles,
				isActive
					? 'pointer-events-none'
					: 'pointer-events-auto text-muted-foreground',
			)}
			icon={
				Icon && (
					<Icon className='size-4 flex-shrink-0' aria-hidden='true' />
				)
			}
			iconPosition='left'
			disableWhilePending={true}
			prefetch={false}
			text={displayName}
		/>
	);
};

export default MenubarItem;
