import type { LinkProps as NextLinkProps } from 'next/link';
import type { BaseProps } from './base-props';

export type LinkProps = BaseProps & {
	/** URL for link button - when provided (non-undefined), renders as Next.js Link */
	href?: string;
	/** Open link in new tab */
	newTab?: boolean;
	/** Custom className applied during navigation pending state (defaults to 'cursor-progress') */
	pendingClassName?: string;
	/** Disable button during navigation pending state */
	disableWhilePending?: boolean;
	/** Next.js link prefetch behavior */
	prefetch?: NextLinkProps['prefetch'];
	/** Fallback URL for auth redirect (defaults to href) */
	authRedirectFallback?: string;
};
