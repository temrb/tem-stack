import type { ReactNode, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { useLinkStatus } from 'next/link';
import { cn } from '@/lib/core/utils';

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
	ref?: Ref<HTMLButtonElement>;
	restProps: Record<string, unknown>;
}

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
}
