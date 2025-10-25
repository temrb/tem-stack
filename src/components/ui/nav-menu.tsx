'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

type MenuItem =
	| {
			id: string;
			type: 'link';
			text: string;
			href: string;
			icon?: ReactNode;
	  }
	| {
			id: string;
			type: 'button';
			text: string;
			onClick: () => void;
			icon?: ReactNode;
	  };

interface NavMenuProps {
	trigger: ReactNode;
	items: MenuItem[];
}

const NavMenu = ({ trigger, items }: NavMenuProps) => {
	const router = useRouter();

	const handleItemClick = (item: MenuItem) => {
		if (item.type === 'link') {
			router.push(item.href);
		} else if (item.type === 'button') {
			item.onClick();
		}
	};

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content
					className='z-50 min-w-[12rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md'
					sideOffset={5}
					align='end'
				>
					{items.map((item, index) => (
						<DropdownMenu.Item
							key={item.id}
							className='relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
							onSelect={() => handleItemClick(item)}
						>
							{item.icon && (
								<span className='flex-shrink-0'>{item.icon}</span>
							)}
							<span>{item.text}</span>
						</DropdownMenu.Item>
					))}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
};

export default NavMenu;
