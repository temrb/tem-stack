import {
	createVersionedPersistOptions,
	migrationUtils,
	type BaseVersionedState,
	type StoreVersionConfig,
} from '@/lib/infra/storage/zustand';
import { MEDIA_QUERIES } from '@/lib/ui/breakpoints';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const isDesktop =
	typeof window !== 'undefined' && window.matchMedia(MEDIA_QUERIES.desktop).matches;

interface LayoutState extends BaseVersionedState {
	menubar: boolean;
	setMenubar: (menubar: boolean) => void;
	toggleMenubar: () => void;
	closeMobileMenubar: () => void;
	isLoading: boolean;
	setLoading: (loading: boolean) => void;
}

// Version migration configuration
const versionConfig: StoreVersionConfig<LayoutState> = {
	currentVersion: 1,
	migrations: [
		{
			version: 1,
			description: 'Add hydration tracking and standardize versioning',
			migrate: (state) => {
				return migrationUtils.addDefaultFields(state, {
					_hasHydrated: false,
				});
			},
		},
	],
	clearOnFailure: true,
	enableLogging: process.env.NODE_ENV === 'development',
};

export const useLayoutStore = create<LayoutState>()(
	persist(
		immer((set) => ({
			menubar: isDesktop,
			setMenubar: (menubar: boolean) =>
				set((state) => {
					state.menubar = menubar;
				}),
			toggleMenubar: () =>
				set((state) => {
					state.menubar = !state.menubar;
				}),
			closeMobileMenubar: () =>
				set((state) => {
					// Check if mobile (< 768px, matching Tailwind md breakpoint)
					const isMobile =
						typeof window !== 'undefined' &&
						window.matchMedia(MEDIA_QUERIES.mobile).matches;
					if (isMobile) {
						state.menubar = false;
					}
				}),
			isLoading: true,
			setLoading: (loading) =>
				set((state) => {
					state.isLoading = loading;
				}),

			// Hydration tracking (standardized)
			_hasHydrated: false,
			_setHasHydrated: (hydrated: boolean) =>
				set((state) => {
					state._hasHydrated = hydrated;
				}),
		})),
		createVersionedPersistOptions('layout', versionConfig, {
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				menubar: state.menubar,
				_hasHydrated: state._hasHydrated,
			}),
			onRehydrateStorage: () => {
				return (state, error) => {
					if (error) {
						console.error('[LayoutStore] Hydration error:', error);
						return;
					}

					if (state) {
						// Set hydration status
						state._setHasHydrated?.(true);
						state.setLoading(false);
					}
				};
			},
		}),
	),
);
