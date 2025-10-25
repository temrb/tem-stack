import type { Route } from '@/lib/core/types/routes';
import { LuLayoutTemplate } from 'react-icons/lu';

/**
 * Account and settings routes - User account management and onboarding
 * These are ancillary routes related to user account lifecycle
 */
const accountRoutes: Route[] = [
	{
		path: '/settings/:path*',
		displayPath: '/settings',
		type: 'private',
		displayName: 'Settings',
		category: 'ancillary',
	},
	{
		path: '/get-started',
		displayPath: '/get-started',
		type: 'public',
		displayName: 'Get Started',
		category: 'ancillary',
	},
	{
		path: '/onboarding',
		displayPath: '/onboarding',
		type: 'private',
		displayName: 'Onboarding',
		category: 'ancillary',
		status: 'soon',
	},
	{
		path: '/profile/:path*',
		displayPath: '/profile',
		type: 'private',
		displayName: 'Profile',
		category: 'ancillary',
		icon: LuLayoutTemplate,
		status: 'soon',
	},
];

export { accountRoutes };
