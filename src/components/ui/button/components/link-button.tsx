import type { MouseEvent, ReactNode, Ref } from 'react';
import Link from '../../link';
import { cn } from '@/lib/core/utils';
import type { ButtonProps } from '../lib/types';
import { buttonVariants } from '../lib/utils';
import { ButtonWithTooltip } from './button-with-tooltip';
import { LinkButtonContent } from './link-button-content';

export interface LinkButtonProps {
	href: string;
	newTab?: boolean;
	prefetch?: boolean | null;
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
	ref?: Ref<HTMLButtonElement>;
	restProps: Record<string, unknown>;
	tooltipContent?: ReactNode;
	tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
	tooltipSideOffset?: number;
	tooltipContentClassName?: string;
	isMobile: boolean;
}

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
				if (handleAuthRedirect(e)) return;
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
