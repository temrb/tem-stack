import type { ReactNode } from 'react';
import { cn } from '@/lib/core/utils';
import { formatShortcut } from '@/hooks/use-keyboard-shortcut';
import LoadingSpinner from '../../../loading/loading-spinner';
import type { ButtonProps } from '../types';
import getSpinnerSize from './get-spinner-size';

interface RenderButtonContentProps {
	children?: ReactNode;
	text?: string;
	loading: boolean;
	icon?: ReactNode;
	iconPosition: 'left' | 'right';
	size?: ButtonProps['size'];
	shortcut?: string;
	count?: number;
	isMobile: boolean;
	textWrapperClassName?: string;
}

/**
 * Renders button content with icons, text, shortcuts, and count badge
 */
export function renderButtonContent({
	children,
	text,
	loading,
	icon,
	iconPosition,
	size,
	shortcut,
	count,
	isMobile,
	textWrapperClassName,
}: RenderButtonContentProps): ReactNode {
	const hasChildren = children !== undefined && children !== null;
	const content = hasChildren ? children : text;
	const hasContent = content !== undefined && content !== null;

	const iconSlot = loading ? (
		<LoadingSpinner size={getSpinnerSize(size, icon)} textNormal={true} />
	) : (
		icon
	);

	// Icon only, no content or shortcut
	if (iconSlot && !hasContent && !shortcut) {
		return iconSlot;
	}

	// Content only, no icon or shortcut
	if (!iconSlot && !shortcut) {
		return hasContent ? (
			textWrapperClassName ? (
				<span className={textWrapperClassName}>{content}</span>
			) : (
				content
			)
		) : null;
	}

	// Complex layout with icon, content, shortcut, or count
	return (
		<div className='flex items-center justify-between gap-2'>
			<div className='flex items-center gap-2'>
				{iconSlot && iconPosition === 'left' && (
					<span className='shrink-0'>{iconSlot}</span>
				)}
				{hasContent && (
					<span className={cn('truncate', textWrapperClassName)}>
						{content}
					</span>
				)}
				{iconSlot && iconPosition === 'right' && (
					<span className='shrink-0'>{iconSlot}</span>
				)}
				{count !== undefined && count > 0 && (
					<span className='ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-[10px] text-primary'>
						{count}
					</span>
				)}
			</div>
			{shortcut && !isMobile && (
				<kbd className='border pointer-events-none hidden h-5 select-none items-center gap-1 rounded bg-muted px-1.5 font-mono text-xs text-muted-foreground opacity-100 md:inline-flex'>
					{formatShortcut(shortcut)}
				</kbd>
			)}
		</div>
	);
}
