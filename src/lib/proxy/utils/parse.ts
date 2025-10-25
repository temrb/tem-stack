import type { NextRequest } from 'next/server';

interface ParsedRequest {
	domain: string;
	path: string;
	fullPath: string;
	key: string;
	fullKey: string;
	searchParamsString: string;
}

export const parse = (req: NextRequest): ParsedRequest => {
	let domain = req.headers.get('host') as string;
	// remove www. from domain and convert to lowercase
	domain = domain.replace('www.', '').toLowerCase();
	let path = req.nextUrl.pathname;

	// fullPath is the full URL path (along with search params)
	const searchParams = req.nextUrl.searchParams.toString();
	const searchParamsString =
		searchParams.length > 0 ? `?${searchParams}` : '';
	const fullPath = `${path}${searchParamsString}`;

	// Here, we are using decodeURIComponent to handle foreign languages like Hebrew
	const key = decodeURIComponent(path.split('/')[1] || ''); // key is the first part of the path (e.g. dub.sh/stats/github -> stats)
	const fullKey = decodeURIComponent(path.slice(1)); // fullKey is the full path without the first slash (to account for multi-level subpaths, e.g. d.to/github/repo -> github/repo)

	return { domain, path, fullPath, key, fullKey, searchParamsString };
};
