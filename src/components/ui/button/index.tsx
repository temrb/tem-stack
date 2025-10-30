// src/components/ui/button/index.tsx
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
import type { ButtonProps } from './lib/types';
import { buttonVariants } from './lib/utils/button-variants';
import getSpinnerSize from './lib/utils/get-spinner-size';

interface LinkButtonContentProps {
	loading: boolean;
	disabled?: boolean;
	disableWhilePending?: boolean;
	isAuthRedirecting: boolean;
	asChild: boolean;
	className?: string;
	pendingClassName?: string;
	disabledTooltip?: React.ReactNode;
	renderContent: (isLoadingOverride?: boolean) => ReactNode;
	ref?: React.Ref<HTMLButtonElement>;
	restProps: Record<string, unknown>;
}

const LinkButtonContent = ({
	loading,
	disabled,
	disableWhilePending,
	isAuthRedirecting,
	asChild,
	className,
	pendingClassName,
	disabledTooltip,
	renderContent,
	ref,
	restProps,
}: LinkButtonContentProps) => {
	const { pending } = useLinkStatus();
	const combinedLoading = loading || pending;
	const combinedDisabled =
		disabled ||
		(disableWhilePending && pending) ||
		combinedLoading ||
		isAuthRedirecting;

	const Comp = asChild ? Slot : 'button';

	return (
		<Comp
			ref={ref}
			disabled={combinedDisabled}
			title={
				disabledTooltip && combinedDisabled
					? String(disabledTooltip)
					: undefined
			}
			className={cn(
				asChild ? className : '',
				combinedDisabled && (pendingClassName || 'cursor-progress'),
			)}
			{...restProps}
		>
			{renderContent(combinedLoading)}
		</Comp>
	);
};

interface LinkButtonProps {
	href: string;
	newTab?: boolean;
	prefetch?: boolean | null;
	loading: boolean;
	disabled?: boolean;
	disableWhilePending?: boolean;
	isAuthRedirecting: boolean;
	asChild: boolean;
	handleAuthRedirect: (event: React.MouseEvent) => boolean;
	onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	variant?: ButtonProps['variant'];
	size?: ButtonProps['size'];
	className?: string;
	pendingClassName?: string;
	disabledTooltip?: React.ReactNode;
	renderContent: (isLoadingOverride?: boolean) => ReactNode;
	ref?: React.Ref<HTMLButtonElement>;
	restProps: Record<string, unknown>;
}

const LinkButton = ({
	href,
	newTab,
	prefetch,
	loading,
	disabled,
	disableWhilePending,
	isAuthRedirecting,
	asChild,
	handleAuthRedirect,
	onClick,
	variant,
	size,
	className,
	pendingClassName,
	disabledTooltip,
	renderContent,
	ref,
	restProps,
}: LinkButtonProps) => {
	return (
		<Link
			href={href}
			newTab={newTab}
			prefetch={prefetch}
			aria-label={restProps['aria-label'] as string | undefined}
			onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
				if (handleAuthRedirect(e)) return;
				onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement>);
			}}
			className={cn(
				buttonVariants({ variant, size }),
				className,
				'[&:has(button:disabled)]:cursor-progress',
			)}
		>
			<LinkButtonContent
				loading={loading}
				disabled={disabled}
				disableWhilePending={disableWhilePending}
				isAuthRedirecting={isAuthRedirecting}
				asChild={asChild}
				className={className}
				pendingClassName={pendingClassName}
				disabledTooltip={disabledTooltip}
				renderContent={renderContent}
				ref={ref}
				restProps={restProps}
			/>
		</Link>
	);
};

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

	validateAriaProps(restProps, 'Button');

	const { data: session, isPending } = useSession();
	const router = useRouter();
	const pathname = usePathname();
	const { isMobile } = useMediaQuery();

	const isAuthenticated = !isPending && !!session;
	const [isAuthRedirecting, setIsAuthRedirecting] = React.useState(false);
	const isDisabled = disabled || loading || isAuthRedirecting;

	const Comp = asChild ? Slot : 'button';

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

	const getAuthRedirectUrl = React.useCallback(() => {
		const destination = authRedirectFallback || href || pathname;
		const url = new URL('/get-started', window.location.origin);
		url.searchParams.set('redirectTo', destination);
		return url.toString();
	}, [authRedirectFallback, href, pathname]);

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

	const handleClick = React.useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			if (handleAuthRedirect(event)) return;
			onClick?.(event);
		},
		[handleAuthRedirect, onClick],
	);

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

	const renderContent = (isLoadingOverride?: boolean): ReactNode => {
		const hasChildren = children !== undefined && children !== null;
		const content = hasChildren ? children : text;
		const hasContent = content !== undefined && content !== null;
		const isCurrentlyLoading = isLoadingOverride ?? loading;

		const iconSlot = isCurrentlyLoading ? (
			<LoadingSpinner
				size={getSpinnerSize(size, icon)}
				textNormal={true}
			/>
		) : (
			icon
		);

		if (iconSlot && !hasContent && !shortcut) {
			return iconSlot;
		}

		if (!iconSlot && !shortcut) {
			return hasContent ? (
				textWrapperClassName ? (
					<span className={textWrapperClassName}>{content}</span>
				) : (
					content
				)
			) : null;
		}

		return (
			<div className='flex items-center justify-between gap-2'>
				<div className='flex items-center gap-2'>
					{iconSlot && iconPosition === 'left' && (
						<span className='shrink-0'>{iconSlot}</span>
					)}
					{hasContent && (
						<span className={cn('truncate', textWrapperClassName)}>
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
	};

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
			/>
		);
	}

	return (
		<Comp
			className={cn(buttonVariants({ variant, size }), className)}
			ref={ref}
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
};

Button.displayName = 'Button';

export { Button, buttonVariants };
