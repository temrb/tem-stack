/**
 * Creates a regular expression pattern for matching routes with dynamic segments
 */
export function createRouteMatcher(routePath: string): RegExp {
	const pattern = routePath
		// Handle catch-all/optional segments (e.g., '/:path*')
		.replace(/\/:\w+\*/g, '(?:/.*)?')
		// Handle required path parameters (e.g., '/:id')
		.replace(/\/:\w+/g, '/[^/]+');

	return new RegExp(`^${pattern}$`);
}
