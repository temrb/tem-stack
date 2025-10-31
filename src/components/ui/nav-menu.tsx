'use client';

import Link from '@/components/ui/link';
import { cn } from '@/lib/core/utils';
import { useLayoutStore } from '@/zustand/ui/use-layout-store';
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
	<Link
		href={item.href || '#'}
		onClick={onClose}
		className='flex w-full justify-start rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground'
		aria-label={`Navigate to ${item.text}`}
	>
		<span className='flex items-center space-x-2'>
			{item.icon}
			<span className='text-xs md:text-sm'>{item.text}</span>
		</span>
	</Link>
);

// Helper component for button menu item
const ButtonMenuItem: React.FC<{ item: MenuItem }> = ({ item }) => (
	<span className='flex w-full items-center space-x-2'>
		{item.icon}
		<span className='text-xs md:text-sm'>{item.text}</span>
	</span>
);

const NavMenu: React.FC<NavMenuProps> = ({
	items,
	trigger,
	align = 'end',
	sideOffset = 5,
	onItemClick,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const { closeMobileMenubar } = useLayoutStore();
	const pathname = usePathname();

	// Validate and memoize items to ensure link items have href
	const validatedItems = useMemo(() => {
		const seen = new Set<string>();
		return items.filter((item) => {
			if (seen.has(item.id)) {
				console.warn(`NavMenu: Duplicate id "${item.id}"`);
				return false;
			}
			seen.add(item.id);
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
		closeMobileMenubar();
	}, [closeMobileMenubar, onItemClick]);

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

			<DropdownMenuContent align={align} sideOffset={sideOffset}>
				{validatedItems.map((item) => {
					const isActive = pathname === item.href;

					// Active items: render as non-interactive div
					if (item.type === 'link' && isActive) {
						return (
							<DropdownMenuItem key={item.id} disabled>
								<ActiveMenuItem item={item} />
							</DropdownMenuItem>
						);
					}

					// Link items: use asChild to make Link the interactive element
					if (item.type === 'link') {
						return (
							<DropdownMenuItem key={item.id} asChild>
								<LinkMenuItem
									item={item}
									onClose={handleCloseDropdown}
								/>
							</DropdownMenuItem>
						);
					}

					// Button items: handle action in onSelect
					return (
						<DropdownMenuItem
							key={item.id}
							onSelect={() => {
								item.onClick?.();
								handleCloseDropdown();
							}}
						>
							<ButtonMenuItem item={item} />
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default NavMenu;
