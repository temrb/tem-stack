// ============= lib/proxy/utils/detect-bot.ts =============
import type { NextRequest } from 'next/server';

/**
 * Simple bot detection that doesn't rely on ua-parser-js
 * This avoids the __dirname issue in edge runtimes
 */
export const detectBot = (req: NextRequest): boolean => {
	// Check URL parameter first
	const url = req.nextUrl;
	if (url.searchParams.get('bot')) return true;

	// Get the user agent string
	const ua = req.headers.get('User-Agent') || '';

	// List of bot identifiers
	const botPatterns = [
		'bot',
		'chatgpt',
		'facebookexternalhit',
		'whatsapp',
		'google',
		'baidu',
		'bing',
		'msn',
		'duckduckbot',
		'teoma',
		'slurp',
		'yandex',
		'metainspector',
		'go-http-client',
		'iframely',
	];

	// Simple string matching instead of regex to improve compatibility
	return botPatterns.some((pattern) =>
		ua.toLowerCase().includes(pattern.toLowerCase()),
	);
};
