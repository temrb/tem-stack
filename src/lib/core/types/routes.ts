import type { IconType } from 'react-icons';

interface Route {
	/** Technical route path pattern used for routing (can contain dynamic segments) */
	path: string;

	/** Clean path for display in UI (without dynamic segments) */
	displayPath: string;

	/** Display name shown in the UI */
	displayName: string;

	/** User roles that can access this route */
	type: 'public' | 'private' | 'admin';

	/** Category of the route */
	category: 'ancillary' | 'feature' | 'admin';

	/** Optional icon for the route */
	icon?: IconType;

	/** Whether this route requires onboarding to be completed */
	onboardingCompleteRequired?: boolean;

	/** Whether this route is marked as coming soon */
	status?: 'soon' | 'next' | 'new';

	/** Whether this route should appear in primary navigation (footer/menubar shortcuts) */
	primaryNav?: boolean;
}

export type { Route };
