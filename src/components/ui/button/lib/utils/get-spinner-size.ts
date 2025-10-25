import type { VariantProps } from 'class-variance-authority';
import { isValidElement, type ReactNode } from 'react';
import type { buttonVariants } from '../..';

const getSpinnerSize = (
	size: VariantProps<typeof buttonVariants>['size'],
	icon: ReactNode,
): number => {
	// For icon buttons, always use 16px to match the button's available space
	// (32px container - 8px padding on each side = 16px)
	if (size === 'icon') {
		return 16;
	}

	// For non-icon buttons, try to extract size from icon className
	if (icon && isValidElement(icon) && icon.props) {
		const iconClassName = (icon.props as { className?: string }).className;
		if (iconClassName && typeof iconClassName === 'string') {
			const sizeMatch = iconClassName.match(/(?:h|w|size)-(\d+)/);
			if (sizeMatch?.[1]) {
				return Number.parseInt(sizeMatch[1], 10) * 4;
			}
		}
	}

	// Fallback to size-based defaults
	switch (size) {
		case 'sm':
			return 14;
		case 'lg':
			return 22;
		default:
			return 20;
	}
};

export default getSpinnerSize;
