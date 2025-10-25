import type { Route } from '@/lib/core/types/routes';
import { LuNewspaper, LuTable2 } from 'react-icons/lu';

/**
 * Core navigation routes - Primary navigation items and their detail pages
 * These appear in the main navigation (footer/menubar)
 */
const coreRoutes: Route[] = [
	// Feed and related pages
	{
		path: '/',
		displayPath: '/',
		displayName: 'Feed',
		type: 'public',
		category: 'ancillary',
		icon: LuNewspaper,
		primaryNav: true,
	},
	{
		path: '/thread/:slugId*',
		displayPath: '/thread',
		displayName: 'Thread',
		type: 'public',
		category: 'ancillary',
	},
	{
		path: '/posts',
		displayPath: '/posts',
		displayName: 'Your Posts',
		type: 'public',
		category: 'ancillary',
	},

	// Track Jobs and related pages
	{
		path: '/track',
		displayPath: '/track',
		displayName: 'Track',
		type: 'private',
		category: 'ancillary',
		icon: LuTable2,
		primaryNav: true,
	},
	{
		path: '/track/visualize/:path*',
		displayPath: '/track/visualize',
		displayName: 'Visualize Tracking',
		type: 'private',
		category: 'ancillary',
	},
];

export { coreRoutes };
