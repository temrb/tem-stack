/**
 * Standardized versioning utilities for Zustand stores with persist middleware
 * Provides type-safe migration patterns and reusable versioning logic
 */

import type { PersistOptions } from 'zustand/middleware';

/**
 * Version migration function type
 */
export type VersionMigrationFn<TState = any> = (
	persistedState: any,
	version: number,
) => TState | Promise<TState>;

/**
 * Migration configuration for a specific version
 */
export interface VersionMigration<TState = any> {
	/** The version this migration targets */
	version: number;
	/** The migration function to transform the old state */
	migrate: VersionMigrationFn<TState>;
	/** Optional description of what this migration does */
	description?: string;
}

/**
 * Configuration for store versioning
 */
export interface StoreVersionConfig<TState = any> {
	/** Current version of the store */
	currentVersion: number;
	/** Array of migration functions for each version */
	migrations: VersionMigration<TState>[];
	/** Whether to clear storage on failed migrations (default: true) */
	clearOnFailure?: boolean;
	/** Whether to log migration processes in development (default: true) */
	enableLogging?: boolean;
}

/**
 * Creates a standardized migrate function for Zustand persist middleware
 */
export function createVersionedMigration<TState = any>(
	config: StoreVersionConfig<TState>,
): VersionMigrationFn<TState> {
	const { migrations, clearOnFailure = true, enableLogging = true } = config;

	return (persistedState: any, version: number): TState => {
		// Log migration start in development
		if (enableLogging && process.env.NODE_ENV === 'development') {
			console.log(
				`[Store Migration] Starting migration from version ${version} to ${config.currentVersion}`,
			);
		}

		try {
			// Find migrations that need to be applied
			const applicableMigrations = migrations
				.filter((migration) => migration.version > version)
				.sort((a, b) => a.version - b.version);

			// Apply migrations sequentially
			let state = persistedState;
			for (const migration of applicableMigrations) {
				if (enableLogging && process.env.NODE_ENV === 'development') {
					console.log(
						`[Store Migration] Applying migration to version ${migration.version}${
							migration.description
								? `: ${migration.description}`
								: ''
						}`,
					);
				}
				state = migration.migrate(state, migration.version - 1);
			}

			if (enableLogging && process.env.NODE_ENV === 'development') {
				console.log(
					'[Store Migration] Migration completed successfully',
				);
			}

			return state;
		} catch (error) {
			if (enableLogging && process.env.NODE_ENV === 'development') {
				console.error('[Store Migration] Migration failed:', error);
			}

			if (clearOnFailure) {
				// Clear corrupted localStorage data
				if (typeof window !== 'undefined') {
					console.warn(
						'[Store Migration] Clearing corrupted storage data due to migration failure',
					);
				}
				return undefined as any; // Force fresh state initialization
			}

			throw error;
		}
	};
}

/**
 * Common migration utilities
 */
export const migrationUtils = {
	/**
	 * Safely renames a field in the persisted state
	 */
	renameField: <T = any>(state: any, oldKey: string, newKey: string): T => {
		if (state && typeof state === 'object' && oldKey in state) {
			state[newKey] = state[oldKey];
			delete state[oldKey];
		}
		return state;
	},

	/**
	 * Safely removes fields from the persisted state
	 */
	removeFields: <T = any>(state: any, fieldsToRemove: string[]): T => {
		if (state && typeof state === 'object') {
			fieldsToRemove.forEach((field) => {
				if (field in state) {
					delete state[field];
				}
			});
		}
		return state;
	},

	/**
	 * Safely adds default values for missing fields
	 */
	addDefaultFields: <T = any>(
		state: any,
		defaults: Record<string, any>,
	): T => {
		if (!state || typeof state !== 'object') {
			return defaults as T;
		}
		// Merge defaults first, then state, to ensure state overrides defaults
		const merged = { ...defaults, ...state };
		return merged as T;
	},

	/**
	 * Transforms nested objects safely
	 */
	transformNested: <T = any>(
		state: any,
		path: string,
		transformer: (value: any) => any,
	): T => {
		if (!state || typeof state !== 'object') {
			return state;
		}

		const keys = path.split('.');
		let current = state;

		// Navigate to the nested object
		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i];
			if (!key || !current[key] || typeof current[key] !== 'object') {
				return state; // Path doesn't exist, return original state
			}
			current = current[key];
		}

		// Apply transformation to the final key
		const finalKey = keys[keys.length - 1];
		if (finalKey && finalKey in current) {
			current[finalKey] = transformer(current[finalKey]);
		}

		return state;
	},

	/**
	 * Validates state structure against a schema
	 */
	validateState: <T = any>(
		state: any,
		requiredFields: string[],
	): state is T => {
		if (!state || typeof state !== 'object') {
			return false;
		}

		return requiredFields.every((field) => {
			const keys = field.split('.');
			let current = state;

			for (const key of keys) {
				if (
					!current ||
					typeof current !== 'object' ||
					!(key in current)
				) {
					return false;
				}
				current = current[key];
			}

			return true;
		});
	},

	/**
	 * Clears related localStorage keys (useful for cleaning up old data)
	 */
	clearRelatedStorage: (patterns: string[]): void => {
		if (typeof window === 'undefined') return;

		patterns.forEach((pattern) => {
			Object.keys(localStorage).forEach((key) => {
				if (key.includes(pattern)) {
					localStorage.removeItem(key);
				}
			});
		});
	},
};

/**
 * Creates standardized persist options with versioning support
 */
export function createVersionedPersistOptions<TState>(
	name: string,
	versionConfig: StoreVersionConfig<TState>,
	additionalOptions?: Partial<PersistOptions<TState, Partial<TState>>>,
): PersistOptions<TState, Partial<TState>> {
	return {
		name,
		version: versionConfig.currentVersion,
		migrate: createVersionedMigration(versionConfig),
		...additionalOptions,
	} as PersistOptions<TState, Partial<TState>>;
}
