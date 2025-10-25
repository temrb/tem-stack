import { AppProxy } from '@/lib/proxy';
import type { NextFetchEvent, NextRequest } from 'next/server';

export const config = {
	matcher: [
		/*
		 * Match all paths except for:
		 * 1. /api/ routes
		 * 2. /_next/ (Next.js internals)
		 * 3. /_proxy/ (special page for OG tags proxying)
		 * 4. /_static (inside /public)
		 * 5. /_vercel (Vercel internals)
		 * 6. Static files (e.g. /favicon.ico, /sitemap.xml, /robots.txt, etc.)
		 */
		'/((?!api/|_next/|_proxy/|_static|_vercel|[\\w-]+\\.\\w+).*)',
	],
};

export default async function proxy(req: NextRequest, ev: NextFetchEvent) {
	return AppProxy(req);
}
