import env from '@/env';
import type { MetadataRoute } from 'next';

/**
 * Sitemap configuration
 *
 * This is now fully static for better performance and Next.js 15 compliance.
 * Uses environment variables directly instead of runtime headers.
 *
 * For dynamic sitemaps with many URLs, use generateSitemaps() function.
 * Learn more: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = env.NEXT_PUBLIC_APP_URL;
	const currentDate = new Date();

	return [
		{
			url: baseUrl,
			lastModified: currentDate,
			changeFrequency: 'hourly',
			priority: 1.0,
		},
		{
			url: `${baseUrl}/get-started`,
			lastModified: currentDate,
			changeFrequency: 'weekly',
			priority: 0.8,
		},
		{
			url: `${baseUrl}/settings`,
			lastModified: currentDate,
			changeFrequency: 'monthly',
			priority: 0.3,
		},
	];
}
