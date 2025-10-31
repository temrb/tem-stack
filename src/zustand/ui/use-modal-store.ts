import type { ModalConfig } from '@/lib/ui/modals';
import type { ModalKey, ModalPropsMap } from '@/modals/registry';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

/**
 * Type for the currently active modal in the store.
 * Generic to ensure props match the modal key.
 */
export type ActiveModal<K extends ModalKey = ModalKey> = {
	key: K;
	props: ModalPropsMap[K];
	config?: ModalConfig;
};

/**
 * Modal state interface
 */
interface ModalState {
	activeModal: ActiveModal | null;
	show: <K extends ModalKey>(
		key: K,
		props: ModalPropsMap[K],
		config?: ModalConfig,
	) => void;
	hide: () => void;
}

/**
 * Zustand store for global modal state management.
 *
 * This store maintains the currently active modal and provides
 * type-safe actions to show and hide modals.
 *
 * Usage:
 * - Direct usage is discouraged - use the `useModals()` hook instead
 * - The hook provides a better developer experience with typed modal functions
 */
export const useModalStore = create<ModalState>()(
	immer((set) => ({
		activeModal: null,

		/**
		 * Show a modal with the given key, props, and optional config.
		 * @param key - The modal key (must be registered in the modal registry)
		 * @param props - Props for the modal component (type-checked based on key)
		 * @param config - Optional modal configuration to override defaults
		 */
		show: (key, props, config) =>
			set((state) => {
				state.activeModal = { key, props, config };
			}),

		/**
		 * Hide the currently active modal.
		 */
		hide: () =>
			set((state) => {
				state.activeModal = null;
			}),
	})),
);
