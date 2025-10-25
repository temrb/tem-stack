import {
	createVersionedPersistOptions,
	migrationUtils,
	type BaseVersionedState,
	type StoreVersionConfig,
} from '@/lib/infra/storage/zustand';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface OnboardingState extends BaseVersionedState {
	completed: boolean;
	setCompleted: (complete: boolean) => void;
}

// Version migration configuration
const versionConfig: StoreVersionConfig<OnboardingState> = {
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

export const useOnboardingStore = create<OnboardingState>()(
	persist(
		immer((set) => ({
			completed: false,
			setCompleted: (completed) =>
				set((state) => {
					state.completed = completed;
				}),

			// Hydration tracking (standardized)
			_hasHydrated: false,
			_setHasHydrated: (hydrated: boolean) =>
				set((state) => {
					state._hasHydrated = hydrated;
				}),
		})),
		createVersionedPersistOptions('onboarding-status', versionConfig, {
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				completed: state.completed,
				_hasHydrated: state._hasHydrated,
			}),
			onRehydrateStorage: () => {
				return (state, error) => {
					if (error) {
						console.error(
							'[OnboardingStore] Hydration error:',
							error,
						);
						return;
					}

					if (state) {
						// Set hydration status
						state._setHasHydrated?.(true);
					}
				};
			},
		}),
	),
);
