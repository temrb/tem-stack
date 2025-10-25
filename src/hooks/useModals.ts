import { useModalStore } from '@/zustand/ui/useModalStore';
import {
	modalRegistry,
	type ModalKey,
	type ModalPropsMap,
} from '@/modals/registry';
import type { ModalConfig } from '@/lib/ui/modals';
import { useMemo } from 'react';

/**
 * Type for the modal opener functions.
 * Each modal key gets its own typed function that requires the correct props.
 *
 * Example:
 * {
 *   deleteAccount: (props: {}, config?: ModalConfig) => void,
 *   editUser: (props: EditUserProps, config?: ModalConfig) => void
 * }
 */
type ModalOpeners = {
	[K in ModalKey]: (props: ModalPropsMap[K], config?: ModalConfig) => void;
};

/**
 * Custom hook for managing modals with full type safety.
 *
 * This hook provides a clean, typed API for opening and closing modals.
 * All modal keys and their required props are automatically inferred from
 * the modal registry, ensuring compile-time type safety.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const modals = useModals();
 *
 *   const handleDelete = () => {
 *     // Type-safe: TypeScript knows deleteAccount takes no props
 *     modals.show.deleteAccount({});
 *   };
 *
 *   const handleEdit = () => {
 *     // Type-safe: TypeScript enforces required props
 *     modals.show.editUser({
 *       userId: '123',
 *       onSuccess: () => console.log('Updated!')
 *     });
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleDelete}>Delete Account</button>
 *       <button onClick={handleEdit}>Edit User</button>
 *       <button onClick={modals.hide}>Close Modal</button>
 *     </>
 *   );
 * }
 * ```
 *
 * @returns An object with:
 * - `show`: Typed functions to open each modal (e.g., `show.deleteAccount()`)
 * - `hide`: Function to close the currently active modal
 */
export function useModals() {
	const { show, hide } = useModalStore();

	/**
	 * Create typed modal opener functions for each registered modal.
	 * Uses useMemo to ensure stable references and prevent unnecessary re-renders.
	 */
	const showFns = useMemo(() => {
		const openers = {} as ModalOpeners;

		for (const key in modalRegistry) {
			const modalKey = key as ModalKey;
			openers[modalKey] = (props, config) => show(modalKey, props, config);
		}

		return openers;
	}, [show]);

	return {
		/**
		 * Typed functions to open modals.
		 * Each modal has its own function with the correct props type.
		 */
		show: showFns,

		/**
		 * Close the currently active modal.
		 */
		hide,
	};
}
