'use client';

import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/core/utils';

export default function Theme() {
	const { setTheme, theme } = useTheme();

	return (
		<div className='flex flex-row'>
			<Button
				className={cn(
					'rounded-r-none border-r-0',
					theme === 'system' && 'pointer-events-none',
				)}
				variant={theme === 'system' ? 'default' : 'outline'}
				size='sm'
				onClick={() => setTheme('system')}
				text='System'
				aria-label='System Theme'
			/>
			<Button
				className={cn(
					'rounded-l-none rounded-r-none',
					theme === 'dark' && 'pointer-events-none',
				)}
				variant={theme === 'dark' ? 'default' : 'outline'}
				size='sm'
				onClick={() => setTheme('dark')}
				text='Dark'
				aria-label='Dark Theme'
			/>
			<Button
				className={cn(
					'rounded-l-none border-l-0',
					theme === 'light' && 'pointer-events-none',
				)}
				variant={theme === 'light' ? 'default' : 'outline'}
				size='sm'
				onClick={() => setTheme('light')}
				text='Light'
				aria-label='Light Theme'
			/>
		</div>
	);
}
