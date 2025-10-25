import env from '@/env';

export const DEFAULT_METADATA = {
	siteName: env.NEXT_PUBLIC_APP_NAME,
	siteUrl: env.NEXT_PUBLIC_APP_URL,
	domain: env.NEXT_PUBLIC_APP_DOMAIN,
	defaultTitle: env.NEXT_PUBLIC_APP_NAME,
	defaultDescription: 'Site description goes here.',
	defaultKeywords: ['keyword1', 'keyword2'],
	author: env.NEXT_PUBLIC_APP_NAME,
	locale: 'en_US',
	type: 'website' as const,
	twitter: {
		site: `@${env.NEXT_PUBLIC_APP_NAME}`,
		creator: `@${env.NEXT_PUBLIC_APP_NAME}`,
		card: 'summary_large_image' as const,
	},
	verification: {
		google: env.NEXT_PUBLIC_GTAG_ID,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large' as const,
			'max-snippet': -1,
		},
	},
	openGraph: {
		type: 'website' as const,
		siteName: env.NEXT_PUBLIC_APP_NAME,
		locale: 'en_US',
		images: {
			width: 1200,
			height: 630,
			alt: `${env.NEXT_PUBLIC_APP_NAME} - Open Graph Image`,
		},
	},
} as const;

export const SOCIAL_IMAGE_SIZES = {
	openGraph: {
		width: 1200,
		height: 630,
	},
	twitter: {
		width: 1200,
		height: 630,
	},
	defaultIcon: {
		width: 32,
		height: 32,
	},
	appleIcon: {
		width: 180,
		height: 180,
	},
} as const;

export const METADATA_PATHS = {
	openGraphImage: '/opengraph-image',
	twitterImage: '/twitter-image',
	favicon: '/favicon.ico',
	icon: '/icon',
	appleIcon: '/apple-icon',
	manifest: '/manifest.json',
	sitemap: '/sitemap.xml',
	robots: '/robots.txt',
} as const;
