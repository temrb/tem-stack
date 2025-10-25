import type { ComponentType, LazyExoticComponent } from 'react';
import * as settingsModals from '@/features/settings/modals';

// Import other feature modals here as they are created
// import * as jobModals from '@/features/jobs/modals';
// import * as profileModals from '@/features/profile/modals';

/**
 * Central Modal Registry
 *
 * This registry aggregates all modal definitions from across the application's features.
 * Each feature exports its modals from a `modals.ts` file, and they are combined here.
 *
 * This provides:
 * - Single source of truth for all available modals
 * - Automatic type inference for modal keys and props
 * - Scalable architecture (add new features without modifying this file much)
 */
export const modalRegistry = {
    ...settingsModals,
    // Spread other feature modals here as they're added
    // ...jobModals,
    // ...profileModals,
} as const;

/**
 * Automatically inferred union type of all modal keys.
 * e.g., 'deleteAccount' | 'updateAlias' | 'createJob' | etc.
 */
export type ModalKey = keyof typeof modalRegistry;

/**
 * Automatically inferred map of modal keys to their props types.
 * This is the type-safe replacement for the old manual ModalDataMap.
 *
 * TypeScript will automatically extract the props type from each modal's
 * Component definition, ensuring full type safety.
 *
 * Example result:
 * {
 *   deleteAccount: Record<string, never>,
 *   updateAlias: { currentAlias: string, onSuccess: (newAlias: string) => void }
 * }
 */
export type ModalPropsMap = {
    [K in ModalKey]: (typeof modalRegistry)[K] extends {
        Component: LazyExoticComponent<ComponentType<infer P>>;
    }
    ? P extends Record<string, unknown>
    ? P
    : Record<string, never>
    : never;
};
