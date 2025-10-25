'use client';

import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks';
import { cn } from '@/lib/core/utils';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import { LuX } from 'react-icons/lu';
import { Drawer } from 'vaul';

// Modal Context for composition components
interface ModalContextType {
	isMobile: boolean;
	onClose: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

const useModalContext = () => {
	const context = useContext(ModalContext);
	if (!context) {
		throw new Error('Modal components must be used within ResponsiveModal');
	}
	return context;
};

interface ResponsiveModalProps {
	children: React.ReactNode;
	className?: string;
	title?: string;
	description?: string;
	isOpen: boolean;
	onClose: () => void;
	preventEscapeClose?: boolean;
	preventClickOutsideClose?: boolean;
	desktopOnly?: boolean;
	size?: 'sm' | 'md' | 'lg' | 'full';
	footer?: React.ReactNode;
}

const sizeClasses = {
	sm: 'max-w-sm',
	md: 'max-w-lg',
	lg: 'max-w-2xl',
	full: 'max-w-full',
};

// Modal Header Component
interface ModalHeaderProps {
	children: React.ReactNode;
	className?: string;
	showCloseButton?: boolean;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
	children,
	className,
	showCloseButton = true,
}) => {
	const { isMobile, onClose } = useModalContext();

	return (
		<div
			className={cn(
				'border-b relative border-border bg-background',
				isMobile ? 'px-4 py-4' : 'px-6 py-6',
				className,
			)}
		>
			{/* Header content - always perfectly centered regardless of close button */}
			<div className='w-full'>{children}</div>

			{/* Close button - absolutely positioned to not affect content layout */}
			{showCloseButton && !isMobile && (
				<Button
					className='absolute right-0 top-0'
					onClick={onClose}
					aria-label='Close modal'
					variant='ghost'
					size='icon'
					icon={<LuX className='size-4' />}
				/>
			)}
		</div>
	);
};

// Modal Body Component
interface ModalBodyProps {
	children: React.ReactNode;
	className?: string;
	scrollable?: boolean;
}

export const ModalBody: React.FC<ModalBodyProps> = ({
	children,
	className,
	scrollable = true,
}) => {
	const { isMobile } = useModalContext();

	return (
		<div
			className={cn(
				'flex-1',
				scrollable && 'overflow-y-auto',
				isMobile ? 'px-4 py-4' : 'px-6 py-4',
				className,
			)}
		>
			{children}
		</div>
	);
};

// Modal Footer Component
interface ModalFooterProps {
	children: React.ReactNode;
	className?: string;
	borderTop?: boolean;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
	children,
	className,
	borderTop = true,
}) => {
	const { isMobile } = useModalContext();

	return (
		<div
			className={cn(
				'sticky bottom-0 z-20 bg-background',
				borderTop && 'border-t border-border',
				// Standardized padding based on reference screenshots
				isMobile ? 'p-4' : 'p-6',
				className,
			)}
		>
			{children}
		</div>
	);
};

export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
	children,
	className,
	title = 'Modal',
	description,
	isOpen,
	onClose,
	preventEscapeClose = false,
	preventClickOutsideClose = false,
	desktopOnly = false,
	size = 'md',
	footer,
}) => {
	const { isMobile } = useMediaQuery();
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (!open && !preventEscapeClose) {
				onClose();
			}
		},
		[onClose, preventEscapeClose],
	);

	const handleOverlayClick = useCallback(
		(e: React.MouseEvent) => {
			if (!preventClickOutsideClose && e.target === e.currentTarget) {
				onClose();
			}
		},
		[onClose, preventClickOutsideClose],
	);

	if (!isMounted) {
		return null;
	}

	const contextValue: ModalContextType = {
		isMobile,
		onClose,
	};

	if (isMobile && !desktopOnly) {
		return (
			<ModalContext.Provider value={contextValue}>
				<Drawer.Root open={isOpen} onOpenChange={handleOpenChange}>
					<Drawer.Portal>
						<Drawer.Overlay
							className='fixed inset-0 z-50 bg-black/60 backdrop-blur-md'
							onClick={handleOverlayClick}
						/>
						<Drawer.Content
							className={cn(
								'border fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-lg border-border bg-background',
								footer
									? 'mt-[5dvh] h-[95dvh]'
									: 'mt-[5dvh] h-auto max-h-[95dvh]',
								className,
							)}
							onOpenAutoFocus={(e) => e.preventDefault()}
							onCloseAutoFocus={(e) => e.preventDefault()}
						>
							{title && (
								<VisuallyHidden>
									<Dialog.Title>{title}</Dialog.Title>
								</VisuallyHidden>
							)}
							{description && (
								<VisuallyHidden>
									<Dialog.Description>
										{description}
									</Dialog.Description>
								</VisuallyHidden>
							)}

							{/* Mobile drag handle */}
							<div className='sticky top-0 z-30 flex w-full items-center justify-center rounded-t-lg bg-background pb-2 pt-3'>
								<div className='h-1 w-12 rounded-full bg-muted-foreground/50' />
							</div>

							{/* Flexible content area */}
							<div className='flex min-h-0 flex-1 flex-col'>
								{children}
							</div>

							{/* Optional sticky footer */}
							{footer && (
								<div className='border-t sticky bottom-0 z-20 border-border bg-background px-4 py-4'>
									{footer}
								</div>
							)}
						</Drawer.Content>
					</Drawer.Portal>
				</Drawer.Root>
			</ModalContext.Provider>
		);
	}

	return (
		<ModalContext.Provider value={contextValue}>
			<Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
				<Dialog.Portal>
					<Dialog.Overlay
						className='fixed inset-0 z-50 bg-black/60 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
						onClick={handleOverlayClick}
					/>
					<Dialog.Content
						className={cn(
							'border fixed left-[50%] top-[50%] z-50 flex w-full translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-lg border-border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
							footer ? 'max-h-[85vh]' : 'max-h-[90vh]',
							sizeClasses[size],
							className,
						)}
						onOpenAutoFocus={(e) => e.preventDefault()}
						onCloseAutoFocus={(e) => e.preventDefault()}
					>
						{title && (
							<VisuallyHidden>
								<Dialog.Title>{title}</Dialog.Title>
							</VisuallyHidden>
						)}
						{description && (
							<VisuallyHidden>
								<Dialog.Description>
									{description}
								</Dialog.Description>
							</VisuallyHidden>
						)}

						{/* Flexible content area */}
						<div className='flex min-h-0 flex-1 flex-col'>
							{children}
						</div>

						{/* Optional sticky footer */}
						{footer && (
							<div className='border-t sticky bottom-0 z-20 border-border bg-background px-6 py-6'>
								{footer}
							</div>
						)}
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</ModalContext.Provider>
	);
};

// Re-export types for external use
export type {
	ModalBodyProps,
	ModalFooterProps,
	ModalHeaderProps,
	ResponsiveModalProps,
};
