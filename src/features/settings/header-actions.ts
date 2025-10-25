import { lazy } from 'react';
import { createHeaderActionDefinition } from '@/lib/ui/header-actions';

/**
 * Settings Feature - Header Action Definitions
 *
 * This file defines all header actions related to the settings feature.
 * Each header action is created using createHeaderActionDefinition() which provides
 * full type inference for props and automatic route matching.
 */

/**
 * Settings page header action
 * Displays a category selector dropdown in the header when viewing settings pages
 */
export const settingsPage = createHeaderActionDefinition({
	Component: lazy(() => import('./components/settings-header-action')),
	config: {
		// Match any pathname that starts with /settings
		routeMatcher: '/settings',
	},
});
