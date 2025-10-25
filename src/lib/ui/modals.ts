import type { ComponentType, LazyExoticComponent } from 'react';

export interface ModalConfig {
	size?: 'sm' | 'md' | 'lg' | 'full';
	preventEscapeClose?: boolean;
	preventClickOutsideClose?: boolean;
	desktopOnly?: boolean;
	className?: string;
	title?: string;
	description?: string;
}

/**
 * Defines the structure of a modal definition.
 * @template P - The props type for the modal component
 */
export interface ModalDefinition<P = Record<string, never>> {
	Component: LazyExoticComponent<ComponentType<P>>;
	defaultConfig?: ModalConfig;
}

/**
 * Helper function to create a modal definition with full type inference.
 * This ensures TypeScript correctly infers the props type for the modal.
 *
 * @example
 * ```ts
 * export const editUser = createModalDefinition<EditUserProps>({
 *   Component: lazy(() => import('./edit-user-modal')),
 *   defaultConfig: { size: 'md' }
 * });
 * ```
 */
export function createModalDefinition<P = Record<string, never>>(
	definition: ModalDefinition<P>,
): ModalDefinition<P> {
	return definition;
}
