'use client';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';
import { useCallback, useState } from 'react';

/**
 * Provides authentication-aware click handling and a redirecting state for button-like elements.
 *
 * @param requireAuth - If true, clicking the element requires the user to be authenticated and may trigger a redirect.
 * @param isAuthenticated - Whether the current user is authenticated.
 * @param authRedirectFallback - Optional fallback destination to redirect to for authentication if provided.
 * @param href - Optional original link destination of the element; used as a redirect target when no fallback is provided.
 * @param pathname - Current pathname; used as the final fallback redirect target when neither `authRedirectFallback` nor `href` are provided.
 * @returns An object containing:
 *  - `isAuthRedirecting`: `true` while an auth redirect is in progress, `false` otherwise.
 *  - `handleAuthRedirect`: a click handler that prevents the default action and initiates an auth redirect when required; returns `true` if a redirect was initiated, `false` otherwise.
 */
export function useButtonAuth({
	requireAuth,
	isAuthenticated,
	authRedirectFallback,
	href,
	pathname,
}: {
	requireAuth: boolean;
	isAuthenticated: boolean;
	authRedirectFallback?: string;
	href?: string;
	pathname: string;
}) {
	const router = useRouter();
	const [isAuthRedirecting, setIsAuthRedirecting] = useState(false);

	const getAuthRedirectUrl = useCallback(() => {
		const destination = authRedirectFallback || href || pathname;
		const url = new URL('/get-started', window.location.origin);
		url.searchParams.set('redirectTo', destination);
		return url.toString();
	}, [authRedirectFallback, href, pathname]);

	const handleAuthRedirect = useCallback(
		(event: MouseEvent<Element>) => {
			if (requireAuth && !isAuthenticated) {
				event.preventDefault();
				event.stopPropagation();
				setIsAuthRedirecting(true);
				router.push(getAuthRedirectUrl());
				return true;
			}
			return false;
		},
		[requireAuth, isAuthenticated, router, getAuthRedirectUrl],
	);

	return { isAuthRedirecting, handleAuthRedirect };
}