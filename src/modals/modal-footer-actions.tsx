'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/core/utils';
import React from 'react';

// Individual action interface
type ModalActionPriority = 'primary' | 'secondary' | 'tertiary';

interface ModalAction {
	label: string;
	onClick: () => void;
	variant?:
		| 'default'
		| 'destructive'
		| 'outline'
		| 'secondary'
		| 'ghost'
		| 'none'
		| 'link';
	disabled?: boolean;
	loading?: boolean;
	'aria-label'?: string;
	size?: 'default' | 'sm' | 'lg' | 'icon' | 'none';
	fullWidth?: boolean;
	/**
	 * Determines the emphasis level of the action.
	 * Buttons render from tertiary (left-most) to primary (right-most)
	 * when using the default layout so that critical actions stay on the right.
	 */
	priority?: ModalActionPriority;
}

// Clean, modern props interface
interface ModalFooterActionsProps {
	actions: ModalAction[];
	layout?: 'default' | 'reverse' | 'center' | 'spread' | 'stack';
	className?: string;
	fullWidth?: boolean;
}

/**
 * Modal footer actions component that supports any number of actions.
 *
 * Usage:
 * ```tsx
 * <ModalFooterActions
 *   actions={[
 *     { label: 'Cancel', onClick: handleCancel, variant: 'outline' },
 *     { label: 'Reset', onClick: handleReset, variant: 'secondary' },
 *     { label: 'Save', onClick: handleSave, variant: 'default' }
 *   ]}
 *   layout="default"
 * />
 * ```
 */
export const ModalFooterActions: React.FC<ModalFooterActionsProps> = ({
	actions,
	layout = 'default',
	className,
	fullWidth = false,
}) => {
	// Handle empty actions
	if (actions.length === 0) {
		return null;
	}

	const priorityOrder: Record<ModalActionPriority, number> = {
		tertiary: 0,
		secondary: 1,
		primary: 2,
	};

	const prioritizedActions = actions.slice().sort((actionA, actionB) => {
		const aPriority = priorityOrder[actionA.priority ?? 'secondary'];
		const bPriority = priorityOrder[actionB.priority ?? 'secondary'];

		return aPriority - bPriority;
	});

	// Determine the actions to render based on layout
	const actionsToRender =
		layout === 'reverse'
			? [...prioritizedActions].reverse()
			: prioritizedActions;

	// Layout-specific container classes
	const getContainerClasses = () => {
		const baseClasses = 'flex items-center';

		switch (layout) {
			case 'stack':
				return cn(baseClasses, 'flex-col gap-2', className);
			case 'center':
				return cn(
					baseClasses,
					'justify-center gap-3 flex-wrap sm:flex-nowrap',
					className,
				);
			case 'spread':
				return cn(
					baseClasses,
					'justify-between gap-3 flex-wrap sm:flex-nowrap',
					className,
				);
			case 'reverse':
			case 'default':
			default:
				return cn(
					baseClasses,
					'justify-end gap-3 flex-wrap sm:flex-nowrap',
					className,
				);
		}
	};

	const getButtonClasses = (action: ModalAction) => {
		const classes = [];

		// Handle loading state
		if (action.loading) {
			classes.push('opacity-50');
		}

		// Handle full width for stack layout
		if (layout === 'stack' && (fullWidth || action.fullWidth)) {
			classes.push('w-full');
		}

		// Handle spread layout full width
		if (layout === 'spread' && fullWidth) {
			classes.push('flex-1');
		}

		// Mobile responsive sizing for non-stack layouts
		if (layout !== 'stack') {
			classes.push('min-w-0 flex-shrink-0');
		}

		return cn(...classes);
	};

	const getButtonVariant = (action: ModalAction) => {
		if (action.variant && action.variant !== 'none') {
			return action.variant;
		}

		const priority = action.priority ?? 'secondary';

		if (priority === 'primary') {
			return 'default';
		}

		return 'outline';
	};

	return (
		<div className={getContainerClasses()}>
			{actionsToRender.map((action, index) => (
				<Button
					key={`${action.label}-${index}`}
					variant={getButtonVariant(action)}
					onClick={action.onClick}
					disabled={action.disabled || action.loading}
					loading={action.loading}
					aria-label={action['aria-label'] || action.label}
					size={action.size === 'none' ? undefined : action.size}
					className={getButtonClasses(action)}
				>
					{action.label}
				</Button>
			))}
		</div>
	);
};

export type { ModalAction, ModalActionPriority, ModalFooterActionsProps };
