import type { Route } from '@/lib/core/types/routes';
import { accountRoutes } from './account';
import { adminRoutes } from './admin';
import { coreRoutes } from './core';
import { menubarRoutes } from './menubar';

/**
 * Main routes array - combines all route definitions
 * Organized by: core navigation → sidebar features → account → admin
 */
const routes: Route[] = [
	...coreRoutes,
	...menubarRoutes,
	...accountRoutes,
	...adminRoutes,
];

/**
 * Helper to get routes by category for easy access
 */
const getRoutesByCategory = (category: Route['category']) => {
	return routes.filter((route) => route.category === category);
};

/**
 * Helper to get feature routes as an object for easy access by display name
 */
const ancillaryRoutes = routes.reduce(
	(acc, route) => {
		if (route.category === 'feature') {
			acc[route.displayName] = route;
		}
		return acc;
	},
	{} as Record<string, Route>,
);

export {
	accountRoutes,
	adminRoutes,
	ancillaryRoutes,
	coreRoutes,
	// Helper functions
	getRoutesByCategory,
	menubarRoutes,
	// Main routes array
	routes,
};
