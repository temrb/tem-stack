import { cn } from '@/lib/core/utils';
import type { ForwardedRef, MouseEvent, ReactNode } from 'react';
import Link from '../../link';
import type { ButtonProps, TooltipProps } from '../lib/types';
import { buttonVariants } from '../lib/utils';
import { ButtonWithTooltip } from './button-with-tooltip';
import { LinkButtonContent } from './link-button-content';

export interface LinkButtonProps extends TooltipProps {
	href: string;
	newTab?: boolean;
	prefetch?: boolean | 'auto' | null;
	loading: boolean;
	disabled?: boolean;
	disableWhilePending?: boolean;
	isAuthRedirecting: boolean;
	asChild: boolean;
	handleAuthRedirect: (event: MouseEvent<Element>) => boolean;
	onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
	variant?: ButtonProps['variant'];
	size?: ButtonProps['size'];
	className?: string;
	pendingClassName?: string;
	disabledTooltip?: ReactNode;
	renderContent: (isLoadingOverride?: boolean) => ReactNode;
	ref?: ForwardedRef<HTMLButtonElement | HTMLAnchorElement>;
	restProps: Record<string, unknown>;
	isMobile: boolean;
}

/**
 * Renders a styled link that behaves and looks like a button, optionally wrapped with a tooltip.
 *
 * Renders a Link containing LinkButtonContent with button styling and interaction props. If `tooltipContent` is provided and `isMobile` is false, the link is wrapped in a ButtonWithTooltip.
 *
 * @param href - Destination URL for the link.
 * @param newTab - Open the link in a new tab when true.
 * @param prefetch - Prefetch behavior passed to the Link component.
 * @param loading - Whether the button is in a loading state.
 * @param disabled - Whether the button is disabled.
 * @param disableWhilePending - When true, disables the button while a pending action is in progress.
 * @param isAuthRedirecting - Whether an auth redirect flow is currently active.
 * @param asChild - Pass through content as a child element to preserve element semantics.
 * @param handleAuthRedirect - Called with the click event; if it returns `true`, navigation and other click handling are aborted.
 * @param onClick - Optional additional click handler invoked if `handleAuthRedirect` does not abort.
 * @param variant - Visual variant passed to button styling.
 * @param size - Visual size passed to button styling.
 * @param className - Additional class names applied to the outer Link.
 * @param pendingClassName - Class name applied when pending.
 * @param disabledTooltip - Optional tooltip content shown when the action is disabled.
 * @param renderContent - Function that returns the content to render inside the link; may accept an optional `isLoadingOverride` boolean.
 * @param ref - Forwarded ref for the underlying button or anchor element.
 * @param restProps - Additional attributes forwarded to the rendered content (e.g., accessibility attributes).
 * @param tooltipContent - Content to show inside the tooltip; when provided and not on mobile, the link is wrapped with a tooltip.
 * @param tooltipSide - Preferred side for the tooltip.
 * @param tooltipSideOffset - Offset for the tooltip position.
 * @param tooltipContentClassName - Additional class names for the tooltip content.
 * @param isMobile - When true, disables tooltip wrapping to avoid showing tooltips on mobile.
 * @returns The rendered Link element, optionally wrapped in a ButtonWithTooltip when `tooltipContent` is provided and `isMobile` is false.
 */
export function LinkButton({
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
	tooltipContent,
	tooltipSide,
	tooltipSideOffset,
	tooltipContentClassName,
	isMobile,
}: LinkButtonProps) {
	const linkElement = (
		<Link
			href={href}
			newTab={newTab}
			prefetch={prefetch}
			aria-label={restProps['aria-label'] as string | undefined}
			onClick={(e: MouseEvent<HTMLAnchorElement>) => {
				if (handleAuthRedirect(e)) {
					e.preventDefault();
					return;
				}
				onClick?.(e as unknown as MouseEvent<HTMLButtonElement>);
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
				{linkElement}
			</ButtonWithTooltip>
		);
	}

	return linkElement;
}