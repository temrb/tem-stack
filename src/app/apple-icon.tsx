import { SOCIAL_IMAGE_SIZES } from '@/lib/metadata/config';
import { createGradientIconElement } from '@/lib/metadata/icon-graphics';
import { ImageResponse } from 'next/og';

// Image metadata - Next.js 15 standard exports
export const size = SOCIAL_IMAGE_SIZES.appleIcon;
export const contentType = 'image/png';

/**
 * Apple touch icon generator
 *
 * This generates the apple-touch-icon for iOS devices.
 * Size is determined by the exported `size` config above (180x180).
 *
 * Note: Uses slightly larger circle scale (0.92) for better appearance on iOS.
 */
export default function AppleIcon() {
	return new ImageResponse(
		createGradientIconElement({
			background: 'transparent',
			circleScale: 0.92,
		}),
		{
			...size,
		},
	);
}
