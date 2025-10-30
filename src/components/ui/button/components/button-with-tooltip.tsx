import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/core/utils';
import type { ButtonWithTooltipProps } from '../lib/types';

/**
 * Wrapper component that conditionally adds tooltip functionality
 */
export function ButtonWithTooltip({
	tooltipContent,
	tooltipSide = 'top',
	tooltipSideOffset = 4,
	tooltipContentClassName,
	isMobile,
	children,
}: ButtonWithTooltipProps) {
	// No tooltip needed on mobile or if no content provided
	if (!tooltipContent || isMobile) {
		return <>{children}</>;
	}

	return (
		<TooltipPrimitive.Provider>
			<TooltipPrimitive.Root>
				<TooltipPrimitive.Trigger asChild>
					{children}
				</TooltipPrimitive.Trigger>
				<TooltipPrimitive.Content
					className={cn(
						'border z-10 overflow-hidden rounded-md border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-950 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50 dark:shadow-none',
						tooltipContentClassName,
					)}
					side={tooltipSide}
					sideOffset={tooltipSideOffset}
				>
					{tooltipContent}
				</TooltipPrimitive.Content>
			</TooltipPrimitive.Root>
		</TooltipPrimitive.Provider>
	);
}
