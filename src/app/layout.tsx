import MainLayout from '@/components/layouts/main';
import env from '@/env';
import { Providers } from '@/providers';
import { Analytics } from '@/scripts';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
// @ts-ignore - allow side-effect global CSS import without declarations
import '../styles/globals.css';

const hubot = localFont({
	src: './fonts/Hubot-Sans.woff2',
	variable: '--font-hubot',
	display: 'swap',
	// weight: '',
});

/**
 * Viewport configuration (Next.js 15 requirement)
 * Separated from metadata object for better performance and compliance
 */
export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#ffffff' },
		{ media: '(prefers-color-scheme: dark)', color: '#0f0f0f' },
	],
};

/**
 * Root layout metadata
 *
 * This serves as the default metadata for all pages in the application.
 * Child pages automatically inherit these values and can override any field.
 * Uses template for child pages: "%s | App Name"
 */
export const metadata: Metadata = {
	metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
	title: {
		template: `%s | ${env.NEXT_PUBLIC_APP_NAME}`,
		default: env.NEXT_PUBLIC_APP_NAME,
	},
	description: 'Description goes here.',
	keywords: ['Keyword set 1', 'Keyword set 2'],
	authors: [{ name: env.NEXT_PUBLIC_APP_NAME }],
	creator: env.NEXT_PUBLIC_APP_NAME,
	publisher: env.NEXT_PUBLIC_APP_NAME,
	generator: 'Next.js',
	applicationName: env.NEXT_PUBLIC_APP_NAME,
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	openGraph: {
		type: 'website',
		siteName: env.NEXT_PUBLIC_APP_NAME,
		locale: 'en_US',
	},
	twitter: {
		card: 'summary_large_image',
		site: `@${env.NEXT_PUBLIC_APP_NAME}`,
		creator: `@${env.NEXT_PUBLIC_APP_NAME}`,
	},
	verification: {
		google: env.NEXT_PUBLIC_GTAG_ID,
	},
	icons: {
		icon: [
			{ url: '/icon.svg', type: 'image/svg+xml' },
			{ url: '/icon.png', sizes: '32x32', type: 'image/png' },
		],
		apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
		shortcut: [{ url: '/icon.svg', type: 'image/svg+xml' }],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<head>
				<Analytics />
			</head>
			<body
				className={`${hubot.className} h-[calc(100dvh)] w-full bg-background text-foreground antialiased`}
			>
				<Providers>
					<MainLayout>{children}</MainLayout>
				</Providers>
				<SpeedInsights />
			</body>
		</html>
	);
}
