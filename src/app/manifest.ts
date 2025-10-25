import env from '@/env';
import { DEFAULT_METADATA } from '@/lib/metadata/config';
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: env.NEXT_PUBLIC_APP_NAME,
		short_name: env.NEXT_PUBLIC_APP_NAME,
		description: DEFAULT_METADATA.defaultDescription,
		start_url: '/',
		display: 'standalone',
		background_color: '#ffffff',
		theme_color: '#3b82f6',
		icons: [
			{
				src: '/icon',
				sizes: '32x32',
				type: 'image/png',
			},
			{
				src: '/apple-icon',
				sizes: '180x180',
				type: 'image/png',
			},
		],
		categories: ['career', 'productivity', 'utilities'],
		lang: 'en',
		dir: 'ltr',
		orientation: 'portrait-primary',
	};
}
