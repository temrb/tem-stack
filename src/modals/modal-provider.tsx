'use client';

import SuspenseWrapper from '@/components/suspense-wrapper';
import LoadingSpinner from '@/components/ui/loading/loading-spinner';
import { useModalStore } from '@/zustand/ui/useModalStore';
import { ResponsiveModal } from '@/modals/responsive-modal';
import { modalRegistry } from '@/modals/registry';

/**
 * Global Modal Provider Component
 *
 * This component is the single rendering point for all modals in the application.
 * It:
 * - Listens to the modal store for the active modal
 * - Looks up the modal definition from the registry
 * - Renders the appropriate modal component with its props
 * - Handles modal configuration (size, close behavior, etc.)
 *
 * Usage:
 * - Mount this once in your app's provider tree
 * - Use the `useModals()` hook to show/hide modals from anywhere
 */
const ModalProvider = () => {
	const { activeModal, hide } = useModalStore();

	/**
	 * Render the currently active modal component.
	 * Returns null if no modal is active or if the modal key is not found in the registry.
	 */
	const renderActiveModal = () => {
		if (!activeModal) return null;

		const definition = modalRegistry[activeModal.key];

		if (!definition) {
			console.warn(
				`Modal with key "${activeModal.key}" not found in registry.`,
			);
			return null;
		}

		const { Component } = definition;

		// Pass the props from the store to the component
		// TypeScript ensures these props match the component's expected type
		return <Component {...(activeModal.props as any)} />;
	};

	/**
	 * Merge default config from the registry with runtime config from the modal call.
	 * Runtime config takes precedence over defaults.
	 */
	const getModalConfig = () => {
		if (!activeModal) return {};

		const definition = modalRegistry[activeModal.key];
		const defaultConfig = definition?.defaultConfig || {};
		const runtimeConfig = activeModal.config || {};

		return {
			...defaultConfig,
			...runtimeConfig,
		};
	};

	const config = getModalConfig();

	return (
		<ResponsiveModal
			isOpen={!!activeModal}
			onClose={hide}
			size={config.size}
			preventEscapeClose={config.preventEscapeClose}
			preventClickOutsideClose={config.preventClickOutsideClose}
			desktopOnly={config.desktopOnly}
			className={config.className}
			title={config.title}
			description={config.description}
		>
			<SuspenseWrapper
				skeleton={
					<div className='flex items-center justify-center p-14'>
						<LoadingSpinner size={24} />
					</div>
				}
			>
				{renderActiveModal()}
			</SuspenseWrapper>
		</ResponsiveModal>
	);
};

export default ModalProvider;
