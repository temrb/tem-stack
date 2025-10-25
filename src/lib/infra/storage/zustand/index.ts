/**
 * Zustand utilities for standardized store versioning and state management
 *
 * This module provides a comprehensive set of utilities for creating type-safe,
 * versioned Zustand stores with robust migration support.
 */

export type * from './types';
export * from './versioning';

// Re-export commonly used types from zustand for convenience
export type {
	Mutate,
	StateCreator,
	StoreApi,
	StoreMutatorIdentifier,
} from 'zustand';

export type {
	PersistOptions,
	PersistStorage,
	StorageValue,
} from 'zustand/middleware';
