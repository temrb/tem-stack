import type { BaseProps } from './base-props';

export type RegularProps = BaseProps & {
	href?: undefined;
	newTab?: undefined;
	pendingClassName?: undefined;
	disableWhilePending?: undefined;
	prefetch?: undefined;
	/** URL for auth redirect (defaults to current pathname) */
	authRedirectFallback?: string;
};
