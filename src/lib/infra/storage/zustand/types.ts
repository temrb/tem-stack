/**
 * TypeScript types for standardized Zustand store versioning system
 */

import type { StateCreator } from 'zustand';
import type { PersistOptions } from 'zustand/middleware';

/**
 * Base state interface that all versioned stores should extend
 */
export interface BaseVersionedState {
	/** Internal flag to track if the store has been hydrated from storage */
	_hasHydrated: boolean;
	/** Method to set hydration status */
	_setHasHydrated: (hydrated: boolean) => void;
}

/**
 * Type helper for immer-compatible versioned states
 * This ensures that the hydration properties are properly handled by immer
 */
export type ImmerVersionedState<T> = T & {
	_hasHydrated: boolean;
	_setHasHydrated: (hydrated: boolean) => void;
};

/**
 * Configuration for store initialization after hydration
 */
export interface HydrationConfig<TState> {
	/** Whether to enable hydration tracking (default: true) */
	enableHydrationTracking?: boolean;
	/** Callback called when hydration starts */
	onHydrationStart?: (state: TState) => void;
	/** Callback called when hydration completes successfully */
	onHydrationComplete?: (state: TState) => void;
	/** Callback called when hydration fails */
	onHydrationError?: (error: Error, state?: TState) => void;
	/** Default values to merge if state is missing or corrupt */
	defaultValues?: Partial<TState>;
	/** Fields to validate after hydration */
	requiredFields?: string[];
}

/**
 * Extended persist options with additional type safety
 */
export interface VersionedPersistOptions<TState, TPersistedState = TState>
	extends Omit<PersistOptions<TState, TPersistedState>, 'migrate'> {
	/** Current version of the store schema */
	version: number;
	/** Migration function for handling version changes */
	migrate?: (
		persistedState: any,
		version: number,
	) => TPersistedState | Promise<TPersistedState>;
	/** Configuration for hydration behavior */
	hydrationConfig?: HydrationConfig<TState>;
}

/**
 * Store factory configuration
 */
export interface StoreConfig<TState> {
	/** Unique name for the store (used as localStorage key) */
	name: string;
	/** Current version of the store schema */
	version: number;
	/** State creator function */
	stateCreator: StateCreator<TState>;
	/** Persist options */
	persistOptions?: Partial<VersionedPersistOptions<TState>>;
	/** Hydration configuration */
	hydrationConfig?: HydrationConfig<TState>;
}

/**
 * Migration step result
 */
export interface MigrationResult<TState> {
	/** Whether the migration was successful */
	success: boolean;
	/** The migrated state (if successful) */
	state?: TState;
	/** Error message (if failed) */
	error?: string;
	/** Version that was migrated to */
	toVersion: number;
	/** Version that was migrated from */
	fromVersion: number;
}

/**
 * Migration context passed to migration functions
 */
export interface MigrationContext {
	/** The version being migrated from */
	fromVersion: number;
	/** The version being migrated to */
	toVersion: number;
	/** Store name for logging purposes */
	storeName?: string;
	/** Whether to enable verbose logging */
	enableLogging?: boolean;
}

/**
 * Enhanced version migration function with context
 */
export type EnhancedVersionMigrationFn<TState = any> = (
	persistedState: any,
	context: MigrationContext,
) => TState | Promise<TState>;

/**
 * Store metadata for debugging and monitoring
 */
export interface StoreMetadata {
	/** Store name */
	name: string;
	/** Current version */
	version: number;
	/** Last migration date */
	lastMigrationDate?: Date;
	/** Migration history */
	migrationHistory?: Array<{
		fromVersion: number;
		toVersion: number;
		date: Date;
		success: boolean;
		error?: string;
	}>;
}

/**
 * Utility type to extract the state type from a store
 */
export type StoreState<T> = T extends (...args: any[]) => infer R ? R : never;

/**
 * Utility type to extract persist-safe properties from a state
 * Excludes functions and internal properties
 */
export type PersistableState<T> = {
	[K in keyof T]: T[K] extends Function
		? never
		: K extends `_${string}`
			? never
			: T[K];
};

/**
 * Type-safe partialize function type
 */
export type PartializeFn<TState, TPersistedState = Partial<TState>> = (
	state: TState,
) => TPersistedState;

/**
 * Configuration for automatic state validation
 */
export interface StateValidationConfig<TState> {
	/** Fields that must be present after hydration */
	requiredFields: (keyof TState)[];
	/** Custom validation function */
	validator?: (state: TState) => boolean;
	/** What to do if validation fails */
	onValidationFailure?: 'reset' | 'merge-defaults' | 'throw';
	/** Default values to use when merging defaults */
	defaultValues?: Partial<TState>;
}

/**
 * Advanced persist configuration with validation and error handling
 */
export interface AdvancedPersistConfig<TState> {
	/** Basic persist options */
	persistOptions: VersionedPersistOptions<TState>;
	/** Validation configuration */
	validation?: StateValidationConfig<TState>;
	/** Hydration configuration */
	hydration?: HydrationConfig<TState>;
	/** Debugging configuration */
	debug?: {
		enableLogging?: boolean;
		logMigrations?: boolean;
		logHydration?: boolean;
	};
}
