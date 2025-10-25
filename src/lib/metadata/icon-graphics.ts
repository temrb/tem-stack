import type { CSSProperties, ReactElement } from 'react';
import { createElement } from 'react';

const DEFAULT_GRADIENT =
	'linear-gradient(to top right, hsl(0 0% 4%), hsl(0 0% 96%))';

interface GradientIconElementOptions {
	background?: string;
	circleScale?: number;
	borderColor?: string;
	borderWidth?: number;
}

/**
 * Creates a gradient circle icon element for use with ImageResponse
 *
 * This function generates a JSX element that can be used with Next.js ImageResponse
 * to create dynamic favicons and app icons.
 *
 * @param options - Configuration options for the icon
 * @returns ReactElement suitable for ImageResponse
 */
export function createGradientIconElement({
	background = 'transparent',
	circleScale = 0.84,
	borderColor,
	borderWidth = 0,
}: GradientIconElementOptions = {}): ReactElement {
	const containerStyle: CSSProperties = {
		width: '100%',
		height: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		background,
	};

	const circleSize = `${Math.min(Math.max(circleScale, 0.1), 1) * 100}%`;

	const circleStyle: CSSProperties = {
		width: circleSize,
		height: circleSize,
		borderRadius: '50%',
		background: DEFAULT_GRADIENT,
	};

	if (borderColor && borderWidth > 0) {
		circleStyle.border = `${borderWidth}px solid ${borderColor}`;
	}

	return createElement(
		'div',
		{ style: containerStyle },
		createElement('div', { style: circleStyle }),
	);
}
