import type { ReactNode } from 'react';
import { cn } from '@/lib/core/utils';
import { formatShortcut } from '@/hooks/useKeyboardShortcut';
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
 * Render the visual content for a button, composing optional icon/spinner, text/children, shortcut hint, and count badge.
 *
 * Children take precedence over `text` when both are provided.
 *
 * - If `loading` is true a spinner replaces the icon slot.
 * - If only an icon (or spinner) is provided with no text/shortcut, that icon is returned directly.
 * - If only text/children are provided with no icon/shortcut, the text/children are returned (wrapped with `textWrapperClassName` when present).
 * - When multiple parts are present, content is rendered with an optional left/right icon, an optional small count badge when `count > 0`, and an optional formatted shortcut hint (hidden on mobile when `isMobile` is true).
 *
 * @param children - Optional React node content; takes precedence over `text`.
 * @param text - Fallback string content when `children` is not provided.
 * @param loading - When true, show a loading spinner in place of the icon slot.
 * @param icon - Optional icon node to render on the left or right.
 * @param iconPosition - Position of the icon relative to the content; either `'left'` or `'right'`.
 * @param size - Button size hint used to determine spinner size when loading.
 * @param shortcut - Optional keyboard shortcut string to display as a compact hint; hidden on mobile (`isMobile`).
 * @param count - Optional numeric badge; rendered when greater than 0.
 * @param isMobile - When true, the shortcut hint is not shown.
 * @param textWrapperClassName - Optional class name applied to the text wrapper when text/children are rendered.
 * @returns The composed ReactNode to be used as button content.
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