import type { Route } from '@/lib/core/types/routes';
import { LuShield } from 'react-icons/lu';

/**
 * Admin routes - Administrative access and tools
 * These routes are restricted to admin users only
 */
const adminRoutes: Route[] = [
	{
		path: '/admin/:path*',
		type: 'admin',
		displayName: 'Admin',
		displayPath: '/admin',
		category: 'admin',
		icon: LuShield,
	},
];

export { adminRoutes };
