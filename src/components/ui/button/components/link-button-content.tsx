import { cn } from '@/lib/core/utils';
import { Slot } from '@radix-ui/react-slot';
import { useLinkStatus } from 'next/link';
import type { ForwardedRef, ReactNode } from 'react';

export interface LinkButtonContentProps {
	loading: boolean;
	disabled?: boolean;
	disableWhilePending?: boolean;
	isAuthRedirecting: boolean;
	asChild: boolean;
	className?: string;
	pendingClassName?: string;
	disabledTooltip?: ReactNode;
	renderContent: (isLoadingOverride?: boolean) => ReactNode;
	ref?: ForwardedRef<HTMLButtonElement | HTMLAnchorElement>;
	restProps: Record<string, unknown>;
}

/**
 * Render a button-like element that applies combined loading and disabled logic and displays content from `renderContent`.
 *
 * @param disableWhilePending - If true, disables the element while Next.js link navigation is pending.
 * @param isAuthRedirecting - If true, treat the element as disabled to prevent interaction during authentication redirects.
 * @param asChild - If true, render a Slot forwarding props to a child element instead of a native `button`.
 * @param pendingClassName - Class name applied when the element is disabled due to loading/pending; defaults to `'cursor-progress'`.
 * @param disabledTooltip - Tooltip text used as the `title` when the element is disabled.
 * @param renderContent - Function that returns the element's children; receives a boolean `isLoading` indicating combined loading state.
 * @param restProps - Additional props to spread onto the rendered element.
 * @returns The rendered `button` or `Slot` element configured with computed disabled and loading state.
 */
export function LinkButtonContent({
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
}: LinkButtonContentProps) {
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
			ref={ref as React.Ref<HTMLButtonElement>}
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
			onClick={(e) => {
				if (combinedDisabled) {
					e.preventDefault();
					return;
				}
			}}
			{...restProps}
		>
			{renderContent(combinedLoading)}
		</Comp>
	);
}