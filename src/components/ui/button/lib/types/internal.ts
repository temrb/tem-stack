import type { ReactNode } from 'react';

/**
 * Shared tooltip props used across Button wrapper components
 */
export interface TooltipProps {
	/** Tooltip content - when provided, wraps button with tooltip */
	tooltipContent?: ReactNode;
	/** Tooltip position relative to button */
	tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
	/** Custom className for tooltip content */
	tooltipContentClassName?: string;
	/** Offset distance from button (in pixels) */
	tooltipSideOffset?: number;
}

/**
 * Props for ButtonWithTooltip wrapper component
 */
export interface ButtonWithTooltipProps extends TooltipProps {
	isMobile: boolean;
	children: ReactNode;
}
