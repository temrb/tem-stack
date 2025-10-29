'use client';

import { useMediaQuery } from '@/hooks';
import {
	formatShortcut,
	useKeyboardShortcut,
} from '@/hooks/useKeyboardShortcut';
import { useSession } from '@/lib/auth/auth-client';
import { validateAriaProps } from '@/lib/core/types/aria-utils';
import { cn } from '@/lib/core/utils';
import { Slot } from '@radix-ui/react-slot';
import { useLinkStatus } from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import Link from '../link';
import LoadingSpinner from '../loading/loading-spinner';
import { buttonVariants } from './lib/utils/button-variants';
import getSpinnerSize from './lib/utils/get-spinner-size';

// Definition for ButtonProps
export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?:
		| 'default'
		| 'destructive'
		| 'outline'
		| 'secondary'
		| 'ghost'
		| 'link'; // Replace with your actual variants
	size?: 'default' | 'sm' | 'lg' | 'icon'; // Replace with your actual sizes
	asChild?: boolean;
	requireAuth?: boolean;
	loading?: boolean;
	icon?: React.ReactNode;
	iconPosition?: 'left' | 'right';
	shortcut?: string;
	disabledTooltip?: React.ReactNode;
	text?: string;
	textWrapperClassName?: string;
	count?: number;
	href?: string;
	newTab?: boolean;
	pendingClassName?: string;
	disableWhilePending?: boolean;
	prefetch?: boolean | null;
	authRedirectFallback?: string;
}

/**
 * LinkButtonContent - MUST be a direct child of Link to use useLinkStatus
 * Handles the button element and pending state for link buttons
 */
const LinkButtonContent = React.memo(
	({
		loading,
		disabled,
		isAuthRedirecting,
		asChild,
		variant,
		size,
		className,
		disabledTooltip,
		renderContent,
		restProps,
		ref,
	}: {
		loading: boolean;
		disabled?: boolean;
		disableWhilePending?: boolean;
		isAuthRedirecting: boolean;
		asChild: boolean;
		variant?: ButtonProps['variant'];
		size?: ButtonProps['size'];
		className?: string;
		pendingClassName?: string;
		disabledTooltip?: React.ReactNode;
		renderContent: (isLoading?: boolean) => ReactNode;
		restProps: Record<string, unknown>;
		ref?: React.Ref<HTMLButtonElement>;
	}) => {
		// useLinkStatus MUST be called inside a Link descendant
		const { pending } = useLinkStatus();

		// Compute states - only include pending if explicitly enabled
		const isLoading = loading || pending;
		const isDisabled = disabled || isAuthRedirecting || isLoading;

		const Comp = asChild ? Slot : 'button';

		return (
			<Comp
				ref={ref}
				disabled={isDisabled}
				aria-busy={isLoading ? 'true' : undefined}
				aria-disabled={isDisabled ? 'true' : undefined}
				title={
					disabledTooltip && isDisabled
						? String(disabledTooltip)
						: undefined
				}
				className={cn(
					buttonVariants({ variant, size }),
					className,
					// Show progress cursor when pending and explicitly handling it
					isLoading && 'cursor-progress',
					// Completely disable interaction when disabled
					isDisabled && 'pointer-events-none opacity-60',
				)}
				{...restProps}
			>
				{renderContent(isLoading)}
			</Comp>
		);
	},
);

LinkButtonContent.displayName = 'LinkButtonContent';

/**
 * LinkButton - Wraps Link component for button-styled links
 * Manages auth redirects and click handling
 */
const LinkButton = React.memo(
	({
		href,
		newTab,
		prefetch,
		loading,
		disabled,
		disableWhilePending,
		isAuthRedirecting,
		asChild,
		variant,
		size,
		className,
		pendingClassName,
		disabledTooltip,
		renderContent,
		onClick,
		handleAuthRedirect,
		restProps,
		ref,
	}: {
		href: string;
		newTab?: boolean;
		prefetch?: boolean | null;
		loading: boolean;
		disabled?: boolean;
		disableWhilePending?: boolean;
		isAuthRedirecting: boolean;
		asChild: boolean;
		variant?: ButtonProps['variant'];
		size?: ButtonProps['size'];
		className?: string;
		pendingClassName?: string;
		disabledTooltip?: React.ReactNode;
		renderContent: (isLoading?: boolean) => ReactNode;
		onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
		handleAuthRedirect: (event: React.MouseEvent) => boolean;
		restProps: Record<string, unknown>;
		ref?: React.Ref<HTMLButtonElement>;
	}) => {
		const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
			// Handle auth redirect first
			if (handleAuthRedirect(e)) return;

			// Trigger onClick if provided
			onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement>);
		};

		return (
			<Link
				href={href}
				newTab={newTab}
				prefetch={prefetch}
				onClick={handleLinkClick}
				aria-label={restProps['aria-label'] as string | undefined}
			>
				<LinkButtonContent
					loading={loading}
					disabled={disabled}
					disableWhilePending={disableWhilePending}
					isAuthRedirecting={isAuthRedirecting}
					asChild={asChild}
					variant={variant}
					size={size}
					className={className}
					pendingClassName={pendingClassName}
					disabledTooltip={disabledTooltip}
					renderContent={renderContent}
					restProps={restProps}
					ref={ref}
				/>
			</Link>
		);
	},
);

LinkButton.displayName = 'LinkButton';

/**
 * Main Button Component
 * Supports both regular buttons and link buttons with comprehensive features
 */
const Button = (
	props: ButtonProps & { ref?: React.Ref<HTMLButtonElement> },
) => {
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
		ref,
		...restProps
	} = props;

	if (process.env.NODE_ENV === 'development') {
		validateAriaProps(restProps, 'Button');
	}

	const { data: session, isPending } = useSession();
	const router = useRouter();
	const pathname = usePathname();
	const { isMobile } = useMediaQuery();
	const isAuthenticated = !isPending && !!session;
	const [isAuthRedirecting, setIsAuthRedirecting] = React.useState(false);

	// Accessibility check for icon-only buttons
	useEffect(() => {
		if (
			process.env.NODE_ENV === 'development' &&
			size === 'icon' &&
			!restProps['aria-label'] &&
			!restProps['aria-labelledby']
		) {
			console.warn(
				'Button: Icon-only buttons require aria-label or aria-labelledby for accessibility',
			);
		}
	}, [size, restProps]);

	/**
	 * Generate auth redirect URL
	 */
	const getAuthRedirectUrl = React.useCallback(() => {
		const destination = authRedirectFallback || href || pathname;
		const url = new URL('/get-started', window.location.origin);
		url.searchParams.set('redirectTo', destination);
		return url.toString();
	}, [authRedirectFallback, href, pathname]);

	/**
	 * Handle authentication redirect when requireAuth is true
	 */
	const handleAuthRedirect = React.useCallback(
		(event: React.MouseEvent) => {
			if (requireAuth && !isAuthenticated) {
				event.preventDefault();
				event.stopPropagation();
				setIsAuthRedirecting(true);
				router.push(getAuthRedirectUrl());
				return true;
			}
			return false;
		},
		[requireAuth, isAuthenticated, router, getAuthRedirectUrl],
	);

	/**
	 * Handle button click with auth redirect check
	 */
	const handleClick = React.useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			if (handleAuthRedirect(event)) return;
			onClick?.(event);
		},
		[handleAuthRedirect, onClick],
	);

	// Keyboard shortcut support
	const isDisabled = disabled || loading || isAuthRedirecting;
	useKeyboardShortcut(
		shortcut || '',
		() => {
			if (!isDisabled && onClick) {
				const syntheticEvent = new MouseEvent('click', {
					bubbles: true,
					cancelable: true,
				}) as unknown as React.MouseEvent<HTMLButtonElement>;
				handleClick(syntheticEvent);
			}
		},
		{
			enabled: !!shortcut && !isDisabled && !isMobile,
		},
	);

	/**
	 * Wraps an icon element with default size-4 class
	 * The size is mutable and can be overridden by passing a className to the icon
	 */
	const wrapIconWithDefaultSize = React.useCallback(
		(iconElement: React.ReactNode): React.ReactNode => {
			if (!React.isValidElement(iconElement)) {
				return iconElement;
			}

			const existingClassName = (iconElement.props as { className?: string })
				.className;
			return React.cloneElement(iconElement, {
				...iconElement.props,
				className: cn('size-4', existingClassName),
			} as Partial<unknown>);
		},
		[],
	);

	/**
	 * Render button content with icon, text, loading spinner, and shortcuts
	 */
	const renderContent = React.useCallback(
		(isLoadingOverride?: boolean): ReactNode => {
			const hasChildren = children != null;
			const content = hasChildren ? children : text;
			const hasContent = content != null;
			const isCurrentlyLoading = isLoadingOverride ?? loading;

			// Determine icon/spinner to show
			const iconSlot = isCurrentlyLoading ? (
				<LoadingSpinner
					size={getSpinnerSize(size, icon)}
					textNormal={true}
				/>
			) : (
				wrapIconWithDefaultSize(icon)
			);

			// Icon-only button (no content, no shortcut)
			if (iconSlot && !hasContent && !shortcut) {
				return iconSlot;
			}

			// Simple text-only content (no icon, no shortcut)
			if (!iconSlot && !shortcut) {
				if (!hasContent) return null;
				return textWrapperClassName ? (
					<span className={textWrapperClassName}>{content}</span>
				) : (
					content
				);
			}

			// Complex layout with icon, content, count, and/or shortcut
			return (
				<div className='flex items-center justify-between gap-2'>
					<div className='flex items-center gap-2'>
						{iconSlot && iconPosition === 'left' && (
							<span className='shrink-0'>{iconSlot}</span>
						)}
						{hasContent && (
							<span
								className={cn('truncate', textWrapperClassName)}
							>
								{content}
							</span>
						)}
						{iconSlot && iconPosition === 'right' && (
							<span className='shrink-0'>{iconSlot}</span>
						)}
						{count !== undefined && count > 0 && (
							<span className='ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-[10px] text-primary'>
								{count}
							</span>
						)}
					</div>
					{shortcut && !isMobile && (
						<kbd className='border pointer-events-none hidden h-5 select-none items-center gap-1 rounded bg-muted px-1.5 font-mono text-xs text-muted-foreground opacity-100 md:inline-flex'>
							{formatShortcut(shortcut)}
						</kbd>
					)}
				</div>
			);
		},
		[
			children,
			text,
			loading,
			icon,
			size,
			iconPosition,
			count,
			shortcut,
			isMobile,
			textWrapperClassName,
		],
	);

	// Render as link button
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
				variant={variant}
				size={size}
				className={className}
				pendingClassName={pendingClassName}
				disabledTooltip={disabledTooltip}
				renderContent={renderContent}
				onClick={onClick}
				handleAuthRedirect={handleAuthRedirect}
				restProps={restProps}
				ref={ref}
			/>
		);
	}

	// Render as regular button
	const Comp = asChild ? Slot : 'button';

	return (
		<Comp
			ref={ref}
			disabled={isDisabled}
			onClick={handleClick}
			aria-busy={loading ? 'true' : undefined}
			title={
				disabledTooltip && isDisabled
					? String(disabledTooltip)
					: undefined
			}
			className={cn(buttonVariants({ variant, size }), className)}
			{...restProps}
		>
			{renderContent()}
		</Comp>
	);
};

Button.displayName = 'Button';

export { Button, buttonVariants };
