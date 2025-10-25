import { lazy } from 'react';
import { createModalDefinition } from '@/lib/ui/modals';

/**
 * Settings Feature - Modal Definitions
 *
 * This file defines all modals related to the settings feature.
 * Each modal is created using createModalDefinition() which provides
 * full type inference for props.
 */

// --- Delete Account Modal ---
// Props: None required (component handles its own data fetching)
export const deleteAccount = createModalDefinition({
	Component: lazy(() => import('./components/modals/delete-account-modal')),
	defaultConfig: {
		size: 'md',
		preventEscapeClose: true,
		title: 'Delete Account',
		description: 'Confirm account deletion',
	},
});

// --- Example: Update Alias Modal (for future use) ---
// Uncomment and implement when needed
// export interface UpdateAliasModalProps {
// 	currentAlias: string;
// 	onSuccess: (newAlias: string) => void;
// }
//
// export const updateAlias = createModalDefinition<UpdateAliasModalProps>({
// 	Component: lazy(() => import('./components/modals/update-alias-modal')),
// 	defaultConfig: {
// 		size: 'sm',
// 		title: 'Update Your Alias',
// 	},
// });
