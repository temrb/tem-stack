import type { ComponentType, LazyExoticComponent } from 'react';
import * as settingsHeaderActions from '@/features/settings/header-actions';
// Import other feature header actions here as they are created
// import * as jobHeaderActions from '@/features/jobs/header-actions';
// import * as profileHeaderActions from '@/features/profile/header-actions';

/**
 * Central Header Action Registry
 *
 * This registry aggregates all header action definitions from across the application's features.
 * Each feature exports its header actions from a `header-actions.ts` file, and they are combined here.
 *
 * This provides:
 * - Single source of truth for all available header actions
 * - Automatic type inference for header action keys and props
 * - Scalable architecture (add new features without modifying this file much)
 * - Dynamic route-based rendering
 */
export const headerActionRegistry = {
	...settingsHeaderActions,
	// Spread other feature header actions here as they're added
	// ...jobHeaderActions,
	// ...profileHeaderActions,
} as const;

/**
 * Automatically inferred union type of all header action keys.
 * e.g., 'settingsPage' | 'dashboardPage' | 'jobsPage' | etc.
 */
export type HeaderActionKey = keyof typeof headerActionRegistry;

/**
 * Automatically inferred map of header action keys to their props types.
 * This ensures full type safety when rendering header actions.
 *
 * TypeScript will automatically extract the props type from each header action's
 * Component definition, ensuring full type safety.
 */
export type HeaderActionPropsMap = {
	[K in HeaderActionKey]: (typeof headerActionRegistry)[K] extends {
		Component: LazyExoticComponent<ComponentType<infer P>>;
	}
		? P extends Record<string, unknown>
			? P
			: Record<string, never>
		: never;
};
