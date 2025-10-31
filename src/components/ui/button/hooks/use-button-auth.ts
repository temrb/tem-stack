'use client';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';
import { useCallback, useState } from 'react';

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
