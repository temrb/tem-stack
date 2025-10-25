/**
 * Proxy session handler
 *
 * This module provides proxy-level session validation for Next.js requests.
 * It acts as an early line of defense, preventing invalid sessions from reaching
 * protected pages or API routes.
 *
 * Used by the main Next.js proxy to validate sessions for page navigations.
 */

import tryCatch from '@/lib/core/utils/try-catch';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getUserViaToken } from './get-user-via-token';

interface SessionValidationResult {
	isValid: boolean;
	shouldRedirect: boolean;
	redirectUrl?: string;
	user?: {
		id: string;
		email: string;
		name: string;
		role?: string;
		onboardingCompleted?: boolean;
	};
}

/**
 * Validates session for proxy-level checks
 *
 * This performs a lightweight validation similar to the server-side validation
 * but optimized for proxy performance requirements.
 *
 * @param req - The Next.js request object
 * @returns Validation result with redirect information if needed
 */
export async function validateProxySession(
	req: NextRequest,
): Promise<SessionValidationResult> {
	const { data: token, error } = await tryCatch(getUserViaToken(req));

	// If token parsing/validation fails, treat as invalid session
	if (error) {
		// Only log sanitized error message to prevent sensitive data exposure
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error';
		console.error('Proxy session validation error:', errorMessage);

		return {
			isValid: false,
			shouldRedirect: true,
			redirectUrl: generateRedirectUrl(req, 'Session validation failed'),
		};
	}

	// If no token, session is invalid but may not need redirect (depends on route)
	if (!token) {
		return {
			isValid: false,
			shouldRedirect: false,
		};
	}

	// Validate required fields in the token/user data
	if (
		!token.sub ||
		typeof token.sub !== 'string' ||
		token.sub.trim() === ''
	) {
		return {
			isValid: false,
			shouldRedirect: true,
			redirectUrl: generateRedirectUrl(req, 'Invalid user ID'),
		};
	}

	if (
		!token.email ||
		typeof token.email !== 'string' ||
		token.email.trim() === ''
	) {
		return {
			isValid: false,
			shouldRedirect: true,
			redirectUrl: generateRedirectUrl(req, 'Invalid email'),
		};
	}

	// Session is valid
	return {
		isValid: true,
		shouldRedirect: false,
		user: {
			id: token.sub,
			email: token.email,
			name: token.name || '',
			role: token.role as string,
			onboardingCompleted: token.onboardingCompleted as boolean,
		},
	};
}

/**
 * Handles invalid session by clearing cookies and redirecting
 *
 * @param req - The Next.js request object
 * @param result - The session validation result
 * @returns NextResponse with redirect and cleared cookies
 */
export function handleInvalidSession(
	req: NextRequest,
	result: SessionValidationResult,
): NextResponse {
	if (!result.shouldRedirect || !result.redirectUrl) {
		// If no redirect needed, just continue with the request
		return NextResponse.next();
	}

	// Create redirect response
	const response = NextResponse.redirect(
		new URL(result.redirectUrl, req.url),
	);

	// Clear NextAuth session cookies
	const cookiesToClear = [
		'next-auth.session-token',
		'__Secure-next-auth.session-token',
		'next-auth.csrf-token',
		'__Host-next-auth.csrf-token',
		'next-auth.callback-url',
		'__Secure-next-auth.callback-url',
	];

	cookiesToClear.forEach((cookieName) => {
		response.cookies.set(cookieName, '', {
			expires: new Date(0),
			path: '/',
			domain: undefined,
			secure: process.env.NODE_ENV === 'production',
			httpOnly: true,
			sameSite: 'lax',
		});
	});

	return response;
}

/**
 * Generates appropriate redirect URL based on the current request
 *
 * @param req - The Next.js request object
 * @param reason - Optional reason for logging purposes
 * @returns Redirect URL with preserved destination if appropriate
 */
function generateRedirectUrl(req: NextRequest, reason?: string): string {
	const currentPath = req.nextUrl.pathname + req.nextUrl.search;

	// Don't preserve redirect for auth pages or API routes
	const authPages = ['/get-started', '/sign-in', '/sign-up', '/auth'];
	const isAuthPage = authPages.some((page) => currentPath.startsWith(page));
	const isApiRoute = currentPath.startsWith('/api');

	if (isAuthPage || isApiRoute || currentPath === '/') {
		return '/get-started';
	}

	// Preserve the intended destination
	const redirectUrl = `/get-started?redirectTo=${encodeURIComponent(currentPath)}`;

	if (reason && process.env.NODE_ENV === 'development') {
		console.log(
			`Session invalidation in proxy: ${reason} - redirecting to ${redirectUrl}`,
		);
	}

	return redirectUrl;
}

/**
 * Utility function to check if a path requires authentication
 * This can be used by proxy to determine if session validation is needed
 *
 * @param pathname - The request pathname
 * @returns true if the path requires authentication
 */
export function requiresAuthentication(pathname: string): boolean {
	// Public paths that don't require authentication
	const publicPaths = [
		'/get-started',
		'/sign-in',
		'/sign-up',
		'/auth',
		'/api/auth',
		'/_next',
		'/_static',
		'/_vercel',
		'/favicon.ico',
		'/robots.txt',
		'/sitemap.xml',
	];

	// Check if path starts with any public path
	return !publicPaths.some((publicPath) => pathname.startsWith(publicPath));
}
