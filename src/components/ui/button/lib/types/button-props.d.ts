type RegularProps = BaseProps & {
	href?: never;
	newTab?: never;
	pendingClassName?: never;
	disableWhilePending?: never;
	prefetch?: never;
	/** URL for auth redirect (defaults to current pathname) */
	authRedirectFallback?: string;
};
