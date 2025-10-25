import type { AriaProps } from '@/lib/core';
import type { VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import type { buttonVariants } from '../utils/button-variants';

export type BaseProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants> &
	AriaProps & {
		/** Require authentication - redirects to sign-in if not authenticated */
		requireAuth?: boolean;
		/** Show loading spinner */
		loading?: boolean;
		/** Icon to display (left or right of content) */
		icon?: ReactNode;
		/** Position of icon relative to content */
		iconPosition?: 'left' | 'right';
		/** Keyboard shortcut (e.g., 'cmd+k') - desktop only */
		shortcut?: string;
		/** Tooltip text shown when button is disabled */
		disabledTooltip?: string | ReactNode;
		/** Render as child component using Radix Slot */
		asChild?: boolean;
		/** Text content for the button - overridden by children if provided */
		text?: string;
		/** Optional className for text wrapper */
		textWrapperClassName?: string;
		/** Optional count badge (displayed after icon when > 0) */
		count?: number;
	};
