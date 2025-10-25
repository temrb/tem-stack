import type { Route } from '@/lib/core/types/routes';
import { LuSearch } from 'react-icons/lu';

/**
 * Sidebar feature routes - Main product features accessible from sidebar
 * All routes here have category: 'feature'
 */
const menubarRoutes: Route[] = [
	{
		path: '/feature-1',
		displayPath: '/feature-1',
		displayName: 'Feature One',
		type: 'public',
		category: 'feature',
		icon: LuSearch,
	},
	{
		path: '/feature-2',
		displayPath: '/feature-2',
		displayName: 'Feature Two',
		type: 'public',
		category: 'feature',
		icon: LuSearch,
	},
];

export { menubarRoutes };
