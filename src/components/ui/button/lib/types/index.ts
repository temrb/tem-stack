// Export all constituent types for better IntelliSense
export type { BaseProps } from './base-props';
export type { RegularProps } from './button-props';
export type { LinkProps } from './link-props';

// Export internal/shared types
export type {
	TooltipProps,
	ButtonWithTooltipProps,
} from './internal';

// Import for local use
import type { LinkProps } from './link-props';
import type { RegularProps } from './button-props';

/**
 * Button component props - discriminated union based on href presence
 * - With href: Link button (uses Next.js Link)
 * - Without href: Regular button element
 */
export type ButtonProps = LinkProps | RegularProps;
