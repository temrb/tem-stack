import env from '@/env';
import type { MetadataRoute } from 'next';

/**
 * Robots.txt configuration
 *
 * This is now fully static for better performance and Next.js 15 compliance.
 * Uses environment variables directly instead of runtime headers.
 *
 * Learn more: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
			},
		],
		sitemap: `${env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
		host: env.NEXT_PUBLIC_APP_DOMAIN,
	};
}
