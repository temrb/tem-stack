// src/components/ui/button/index.tsx
'use client';
import { useMediaQuery } from '@/hooks';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useSession } from '@/lib/auth/auth-client';
import { validateAriaProps } from '@/lib/core/types/aria-utils';
import { cn } from '@/lib/core/utils';
import { Slot } from '@radix-ui/react-slot';
import { usePathname } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';
import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { ButtonWithTooltip } from './components/button-with-tooltip';
import { LinkButton } from './components/link-button';
import { useButtonAuth } from './hooks';
import type { ButtonProps } from './lib/types';
import { buttonVariants, renderButtonContent } from './lib/utils';

// ============================================================================
// Main Button Component
// ============================================================================

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
	(props, ref) => {
		const {
			className,
			variant,
			size,
			requireAuth = false,
			loading = false,
			children,
			onClick,
			icon,
			iconPosition = 'left',
			shortcut,
			disabledTooltip,
			disabled,
			asChild = false,
			text,
			textWrapperClassName,
			count,
			href,
			newTab,
			pendingClassName,
			disableWhilePending,
			prefetch,
			authRedirectFallback,
			tooltipContent,
			tooltipSide,
			tooltipSideOffset,
			tooltipContentClassName,
			...restProps
		} = props;

		validateAriaProps(restProps, 'Button');

		const { data: session, isPending } = useSession();
		const pathname = usePathname();
		const { isMobile } = useMediaQuery();

		const isAuthenticated = !isPending && !!session;
		const { isAuthRedirecting, handleAuthRedirect } = useButtonAuth({
			requireAuth,
			isAuthenticated,
			authRedirectFallback,
			href,
			pathname,
		});

		const isDisabled = disabled || loading || isAuthRedirecting;
		const Comp = asChild ? Slot : 'button';

		// Internal ref for keyboard shortcut handling
		const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);

		// Merge internal ref with forwarded ref
		const setButtonRef = useCallback(
			(node: HTMLButtonElement | HTMLAnchorElement | null) => {
				buttonRef.current = node;
				if (!ref) return;
				if (typeof ref === 'function') {
					ref(node);
				} else {
					(ref as React.MutableRefObject<HTMLButtonElement | HTMLAnchorElement | null>).current = node;
				}
			},
			[ref],
		);

		// Accessibility warning for icon-only buttons in development
		useEffect(() => {
			if (
				process.env.NODE_ENV === 'development' &&
				size === 'icon' &&
				!restProps['aria-label'] &&
				!restProps['aria-labelledby']
			) {
				console.warn(
					`Accessibility Warning: An icon-only button should have an 'aria-label' or 'aria-labelledby' prop for screen readers.`,
				);
			}
		}, [size, restProps]);

		const handleClick = useCallback(
			(event: MouseEvent<HTMLButtonElement>) => {
				if (handleAuthRedirect(event)) return;
				onClick?.(event);
			},
			[handleAuthRedirect, onClick],
		);

		// Keyboard shortcut support
		useKeyboardShortcut(
			shortcut || '',
			() => {
				if (!isDisabled) {
					buttonRef.current?.click();
				}
			},
			{
				enabled: !!shortcut && !isDisabled && !isMobile,
			},
		);

		// Memoized content renderer
		const renderContent = useCallback(
			(isLoadingOverride?: boolean): ReactNode => {
				return renderButtonContent({
					children,
					text,
					loading: isLoadingOverride ?? loading,
					icon,
					iconPosition,
					size,
					shortcut,
					count,
					isMobile,
					textWrapperClassName,
				});
			},
			[
				children,
				text,
				loading,
				icon,
				iconPosition,
				size,
				shortcut,
				count,
				isMobile,
				textWrapperClassName,
			],
		);

		// Link button variant
		if (href) {
			return (
				<LinkButton
					href={href}
					newTab={newTab}
					prefetch={prefetch}
					loading={loading}
					disabled={disabled}
					disableWhilePending={disableWhilePending}
					isAuthRedirecting={isAuthRedirecting}
					asChild={asChild}
					handleAuthRedirect={handleAuthRedirect}
					onClick={onClick}
					variant={variant}
					size={size}
					className={className}
					pendingClassName={pendingClassName}
					disabledTooltip={disabledTooltip}
					renderContent={renderContent}
					ref={ref}
					restProps={restProps}
					tooltipContent={tooltipContent}
					tooltipSide={tooltipSide}
					tooltipSideOffset={tooltipSideOffset}
					tooltipContentClassName={tooltipContentClassName}
					isMobile={isMobile}
				/>
			);
		}

		// Regular button variant
		const buttonElement = (
			<Comp
				className={cn(buttonVariants({ variant, size }), className)}
				ref={setButtonRef}
				disabled={isDisabled}
				onClick={handleClick}
				aria-busy={loading ? 'true' : undefined}
				title={
					disabledTooltip && isDisabled
						? String(disabledTooltip)
						: undefined
				}
				{...restProps}
			>
				{renderContent()}
			</Comp>
		);

		// Wrap with tooltip if content provided
		if (tooltipContent && !isMobile) {
			return (
				<ButtonWithTooltip
					tooltipContent={tooltipContent}
					tooltipSide={tooltipSide}
					tooltipSideOffset={tooltipSideOffset}
					tooltipContentClassName={tooltipContentClassName}
					isMobile={isMobile}
				>
					{buttonElement}
				</ButtonWithTooltip>
			);
		}

		return buttonElement;
	},
);

Button.displayName = 'Button';

export { Button, buttonVariants };
