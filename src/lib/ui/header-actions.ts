import type { ComponentType, LazyExoticComponent } from 'react';

/**
 * Route matcher function type
 * Returns true if the header action should be rendered for the given pathname
 */
export type RouteMatcher = (pathname: string) => boolean;

/**
 * Configuration for a header action
 */
export interface HeaderActionConfig {
	/**
	 * Route matcher function or simple pathname prefix string
	 * - Function: Custom logic to determine if action should render
	 * - String: Will match if pathname starts with this string
	 */
	routeMatcher: RouteMatcher | string;
}

/**
 * Defines the structure of a header action definition.
 * @template P - The props type for the header action component
 */
export interface HeaderActionDefinition<P = Record<string, never>> {
	Component: LazyExoticComponent<ComponentType<P>>;
	config: HeaderActionConfig;
}

/**
 * Helper function to create a header action definition with full type inference.
 * This ensures TypeScript correctly infers the props type for the header action.
 *
 * @example
 * ```ts
 * export const settingsPage = createHeaderActionDefinition({
 *   Component: lazy(() => import('./components/settings-header-action')),
 *   config: {
 *     routeMatcher: '/settings'
 *   }
 * });
 * ```
 *
 * @example
 * ```ts
 * export const dashboard = createHeaderActionDefinition({
 *   Component: lazy(() => import('./components/dashboard-header-action')),
 *   config: {
 *     routeMatcher: (pathname) => pathname.startsWith('/dashboard')
 *   }
 * });
 * ```
 */
export function createHeaderActionDefinition<P = Record<string, never>>(
	definition: HeaderActionDefinition<P>,
): HeaderActionDefinition<P> {
	return definition;
}

/**
 * Helper to normalize route matcher to a function
 */
export function normalizeRouteMatcher(
	matcher: RouteMatcher | string,
): RouteMatcher {
	if (typeof matcher === 'string') {
		return (pathname: string) => pathname.startsWith(matcher);
	}
	return matcher;
}
