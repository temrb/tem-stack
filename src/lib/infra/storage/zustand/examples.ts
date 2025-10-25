/**
 * Examples demonstrating how to use the standardized Zustand store versioning system
 *
 * These examples show common patterns and use cases for versioned Zustand stores
 * in the project.
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
	createVersionedPersistOptions,
	migrationUtils,
	type BaseVersionedState,
	type StoreVersionConfig,
} from './index';

/**
 * Example 1: Simple store with basic versioning
 *
 * This shows how to create a simple store with standardized versioning
 */

interface SimpleExampleState extends BaseVersionedState {
	count: number;
	name: string;
	increment: () => void;
	setName: (name: string) => void;
}

const simpleVersionConfig: StoreVersionConfig<SimpleExampleState> = {
	currentVersion: 2,
	migrations: [
		{
			version: 1,
			description: 'Initial version with hydration tracking',
			migrate: (state) => {
				return migrationUtils.addDefaultFields(state, {
					_hasHydrated: false,
				});
			},
		},
		{
			version: 2,
			description: 'Add name field to state',
			migrate: (state) => {
				return migrationUtils.addDefaultFields(state, {
					name: 'Anonymous User',
				});
			},
		},
	],
};

export const useSimpleExampleStore = create<SimpleExampleState>()(
	persist(
		immer((set) => ({
			count: 0,
			name: 'Anonymous User',
			increment: () =>
				set((state) => {
					state.count += 1;
				}),
			setName: (name: string) =>
				set((state) => {
					state.name = name;
				}),

			// Standardized hydration tracking
			_hasHydrated: false,
			_setHasHydrated: (hydrated: boolean) =>
				set((state) => {
					state._hasHydrated = hydrated;
				}),
		})),
		createVersionedPersistOptions('simple-example', simpleVersionConfig, {
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				count: state.count,
				name: state.name,
				_hasHydrated: state._hasHydrated,
			}),
			onRehydrateStorage: () => {
				return (state, error) => {
					if (error) {
						console.error(
							'[SimpleExampleStore] Hydration error:',
							error,
						);
						return;
					}
					if (state) {
						state._setHasHydrated?.(true);
					}
				};
			},
		}),
	),
);

/**
 * Example 2: Complex store with field renaming and validation
 *
 * This shows advanced migration patterns including field renaming,
 * data transformation, and validation
 */

interface ComplexExampleState extends BaseVersionedState {
	userProfile: {
		fullName: string; // Renamed from 'name' in v2
		email: string;
		preferences: {
			theme: 'light' | 'dark';
			notifications: boolean;
		};
	};
	settings: {
		language: string;
		timezone: string;
	};
	updateUserProfile: (
		profile: Partial<ComplexExampleState['userProfile']>,
	) => void;
	updateSettings: (
		settings: Partial<ComplexExampleState['settings']>,
	) => void;
}

const complexVersionConfig: StoreVersionConfig<ComplexExampleState> = {
	currentVersion: 3,
	migrations: [
		{
			version: 1,
			description: 'Initial version with hydration tracking',
			migrate: (state) => {
				return migrationUtils.addDefaultFields(state, {
					_hasHydrated: false,
				});
			},
		},
		{
			version: 2,
			description: 'Rename name to fullName and restructure',
			migrate: (state) => {
				// Rename field in nested object
				if (state.userProfile?.name) {
					state.userProfile.fullName = state.userProfile.name;
					delete state.userProfile.name;
				}

				// Add missing default preferences
				return migrationUtils.addDefaultFields(state, {
					userProfile: {
						fullName: '',
						email: '',
						preferences: {
							theme: 'light' as const,
							notifications: true,
						},
					},
				});
			},
		},
		{
			version: 3,
			description: 'Add settings configuration',
			migrate: (state) => {
				return migrationUtils.addDefaultFields(state, {
					settings: {
						language: 'en',
						timezone: 'UTC',
					},
				});
			},
		},
	],
	clearOnFailure: true,
	enableLogging: process.env.NODE_ENV === 'development',
};

export const useComplexExampleStore = create<ComplexExampleState>()(
	persist(
		immer((set) => ({
			userProfile: {
				fullName: '',
				email: '',
				preferences: {
					theme: 'light',
					notifications: true,
				},
			},
			settings: {
				language: 'en',
				timezone: 'UTC',
			},
			updateUserProfile: (profile) =>
				set((state) => {
					Object.assign(state.userProfile, profile);
				}),
			updateSettings: (settings) =>
				set((state) => {
					Object.assign(state.settings, settings);
				}),

			// Standardized hydration tracking
			_hasHydrated: false,
			_setHasHydrated: (hydrated: boolean) =>
				set((state) => {
					state._hasHydrated = hydrated;
				}),
		})),
		createVersionedPersistOptions('complex-example', complexVersionConfig, {
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				userProfile: state.userProfile,
				settings: state.settings,
				_hasHydrated: state._hasHydrated,
			}),
			onRehydrateStorage: () => {
				return (state, error) => {
					if (error) {
						console.error(
							'[ComplexExampleStore] Hydration error:',
							error,
						);
						return;
					}

					if (state) {
						// Validate state structure after hydration
						const isValid = migrationUtils.validateState(state, [
							'userProfile.fullName',
							'userProfile.email',
							'settings.language',
						]);

						if (!isValid) {
							console.warn(
								'[ComplexExampleStore] Invalid state structure detected',
							);
							// Could trigger a re-migration or reset to defaults
						}

						state._setHasHydrated?.(true);
					}
				};
			},
		}),
	),
);

/**
 * Example 3: Non-persisted store with standardized interface
 *
 * Shows how to use BaseVersionedState even for stores that don't persist
 */

interface TemporaryState extends BaseVersionedState {
	tempData: string[];
	isProcessing: boolean;
	addTempData: (data: string) => void;
	clearTempData: () => void;
	setProcessing: (processing: boolean) => void;
}

export const useTemporaryStore = create<TemporaryState>()(
	immer((set) => ({
		tempData: [],
		isProcessing: false,
		addTempData: (data) =>
			set((state) => {
				state.tempData.push(data);
			}),
		clearTempData: () =>
			set((state) => {
				state.tempData = [];
			}),
		setProcessing: (processing) =>
			set((state) => {
				state.isProcessing = processing;
			}),

		// Always hydrated since not persisted
		_hasHydrated: true,
		_setHasHydrated: (hydrated: boolean) =>
			set((state) => {
				state._hasHydrated = hydrated;
			}),
	})),
);

/**
 * Example 4: Store with async migration
 *
 * Demonstrates how to handle asynchronous migration scenarios
 */

interface AsyncMigrationState extends BaseVersionedState {
	apiData: Record<string, any>;
	lastSync: number;
	syncData: () => Promise<void>;
}

const asyncVersionConfig: StoreVersionConfig<AsyncMigrationState> = {
	currentVersion: 2,
	migrations: [
		{
			version: 1,
			description: 'Initial version with hydration tracking',
			migrate: (state) => {
				return migrationUtils.addDefaultFields(state, {
					_hasHydrated: false,
				});
			},
		},
		{
			version: 2,
			description: 'Clear old API data format (async)',
			migrate: async (state) => {
				// Could perform async operations here
				// For example, transforming data or validating against API

				if (state.apiData && typeof state.apiData === 'object') {
					// Transform old format to new format
					const transformedData = Object.entries(
						state.apiData,
					).reduce(
						(acc, [key, value]) => {
							// Example transformation logic
							acc[`transformed_${key}`] = value;
							return acc;
						},
						{} as Record<string, any>,
					);

					state.apiData = transformedData;
				}

				return state;
			},
		},
	],
	clearOnFailure: true,
	enableLogging: process.env.NODE_ENV === 'development',
};

export const useAsyncMigrationStore = create<AsyncMigrationState>()(
	persist(
		immer((set, get) => ({
			apiData: {},
			lastSync: Date.now(),
			syncData: async () => {
				// Simulated async data sync
				set((state) => {
					state.lastSync = Date.now();
				});
			},

			// Standardized hydration tracking
			_hasHydrated: false,
			_setHasHydrated: (hydrated: boolean) =>
				set((state) => {
					state._hasHydrated = hydrated;
				}),
		})),
		createVersionedPersistOptions(
			'async-migration-example',
			asyncVersionConfig,
			{
				storage: createJSONStorage(() => localStorage),
				partialize: (state) => ({
					apiData: state.apiData,
					lastSync: state.lastSync,
					_hasHydrated: state._hasHydrated,
				}),
			},
		),
	),
);

/**
 * Usage patterns and best practices:
 *
 * 1. Always extend BaseVersionedState for consistency
 * 2. Use descriptive migration descriptions
 * 3. Increment version numbers sequentially
 * 4. Use migrationUtils for common operations
 * 5. Include _hasHydrated in partialize if using persistence
 * 6. Handle errors gracefully in onRehydrateStorage
 * 7. Test migrations thoroughly with real data
 * 8. Consider validation after complex migrations
 * 9. Use clearOnFailure for production safety
 * 10. Enable logging in development for debugging
 */
