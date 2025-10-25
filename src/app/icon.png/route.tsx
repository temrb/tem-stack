import { SOCIAL_IMAGE_SIZES } from '@/lib/metadata/config';
import { createGradientIconElement } from '@/lib/metadata/icon-graphics';
import { ImageResponse } from 'next/og';

/**
 * PNG Icon Route Handler (Fallback)
 *
 * This provides PNG fallback for browsers that don't support SVG favicons.
 * Primary favicon is now SVG (icon.svg) which provides true vector rendering.
 *
 * Size: 32x32px PNG
 */
export async function GET() {
	return new ImageResponse(
		createGradientIconElement({
			background: 'transparent',
			circleScale: 0.88,
		}),
		{
			...SOCIAL_IMAGE_SIZES.defaultIcon,
			headers: {
				'Cache-Control': 'public, max-age=31536000, immutable',
			},
		},
	);
}
