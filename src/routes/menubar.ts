import type { Route } from '@/lib/core/types/routes';
import { LuNotebook, LuSearch } from 'react-icons/lu';

/**
 * Sidebar feature routes - Main product features accessible from sidebar
 * All routes here have category: 'feature'
 */
const menubarRoutes: Route[] = [
	{
		path: '/notes',
		displayPath: '/notes',
		displayName: 'Notes',
		type: 'private',
		category: 'feature',
		icon: LuNotebook,
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
