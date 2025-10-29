'use client';

import Link from '@/components/ui/link';
import { useMediaQuery } from '@/hooks';
import { cn } from '@/lib/core/utils';
import { useLayoutStore } from '@/zustand/ui/useLayoutStore';
import { usePathname } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from './button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './dropdown-menu';

type MenuItem = {
	id: string;
	type: 'link' | 'button';
	text: string;
	icon: React.ReactNode;
	href?: string;
	onClick?: () => void;
};

type NavMenuProps = {
	items: MenuItem[];
	trigger: React.ReactNode;
	align?: 'start' | 'center' | 'end';
	sideOffset?: number;
	onItemClick?: () => void;
};

// Helper component for active menu item
const ActiveMenuItem: React.FC<{ item: MenuItem }> = ({ item }) => (
	<div
		className={cn(
			'flex w-full justify-start rounded-md px-3 py-2',
			'cursor-default bg-foreground font-medium text-background',
		)}
		aria-current='page'
		aria-label={`${item.text} (current page)`}
	>
		<span className='flex items-center space-x-2'>
			{item.icon}
			<span className='text-xs md:text-sm'>{item.text}</span>
		</span>
	</div>
);

// Helper component for link menu item
const LinkMenuItem: React.FC<{ item: MenuItem; onClose: () => void }> = ({
	item,
	onClose,
}) => (
	<Button
		size='sm'
		className='flex w-full justify-start'
		variant='ghost'
		asChild
		onClick={onClose}
		aria-label={`Navigate to ${item.text}`}
	>
		<Link href={item.href || '#'} aria-label={`Navigate to ${item.text}`}>
			<span className='flex items-center space-x-2'>
				{item.icon}
				<span className='text-xs md:text-sm'>{item.text}</span>
			</span>
		</Link>
	</Button>
);

// Helper component for button menu item
const ButtonMenuItem: React.FC<{ item: MenuItem; onClose: () => void }> = ({
	item,
	onClose,
}) => (
	<Button
		variant='ghost'
		className='flex w-full justify-start'
		size='sm'
		onClick={() => {
			item.onClick?.();
			onClose();
		}}
		aria-label={item.text}
	>
		<span className='flex items-center space-x-2'>
			{item.icon}
			<span className='text-xs md:text-sm'>{item.text}</span>
		</span>
	</Button>
);

const NavMenu: React.FC<NavMenuProps> = ({
	items,
	trigger,
	align = 'end',
	sideOffset = 5,
	onItemClick,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const { isMobile } = useMediaQuery();
	const { setMenubar } = useLayoutStore();
	const pathname = usePathname();

	// Validate and memoize items to ensure link items have href
	const validatedItems = useMemo(() => {
		return items.filter((item) => {
			if (item.type === 'link' && !item.href) {
				console.warn(
					`NavMenu: Link item "${item.text}" is missing href`,
				);
				return false;
			}
			if (item.type === 'button' && !item.onClick) {
				console.warn(
					`NavMenu: Button item "${item.text}" is missing onClick`,
				);
				return false;
			}
			return true;
		});
	}, [items]);

	const handleCloseDropdown = useCallback(() => {
		onItemClick?.();
		setIsOpen(false);
		if (isMobile) {
			setMenubar(false);
		}
	}, [isMobile, setMenubar, onItemClick]);

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

			<DropdownMenuContent align={align} sideOffset={sideOffset}>
				{validatedItems.map((item) => {
					const isActive = pathname === item.href;
					return (
						<DropdownMenuItem key={item.id}>
							{item.type === 'link' ? (
								isActive ? (
									<ActiveMenuItem item={item} />
								) : (
									<LinkMenuItem
										item={item}
										onClose={handleCloseDropdown}
									/>
								)
							) : (
								<ButtonMenuItem
									item={item}
									onClose={handleCloseDropdown}
								/>
							)}
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default NavMenu;
