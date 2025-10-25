import type { Route } from '@/lib/core/types/routes';
import { UserRole } from '@/prisma/site/.generated/enums';
import { routes } from '@/routes';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createRouteMatcher } from '../utils/route-matcher';

// Paths requiring redirection when signed in
const REDIRECT_PATHS = ['/get-started'];

/**
 * Find the route configuration for a given pathname
 */
function findRouteConfig(pathname: string): Route | undefined {
	return routes.find((route) => {
		const routeRegExp = createRouteMatcher(route.path);
		return routeRegExp.test(pathname);
	});
}

/**
 * Check if a route requires onboarding to be completed
 */
function requiresOnboarding(pathname: string): boolean {
	const routeConfig = findRouteConfig(pathname);
	return routeConfig?.onboardingCompleteRequired === true;
}

/**
 * Check if a route is accessible for a given user role
 */
function isRouteAccessibleForRole(
	pathname: string,
	userRole: UserRole,
): boolean {
	// Admin users in admin mode can access all routes
	if (userRole === UserRole.ADMIN) {
		if (pathname.startsWith('/admin')) {
			return true;
		}
	}

	const routeConfig = findRouteConfig(pathname);
	if (!routeConfig) {
		// If route is not in our config, allow access (let Next.js handle 404)
		return true;
	}

	// Map UserRole to route type
	const roleToRouteType: Record<UserRole, Route['type'][]> = {
		[UserRole.USER]: ['public', 'private'],
		[UserRole.ADMIN]: ['public', 'private', 'admin'],
	};

	const allowedTypes = roleToRouteType[userRole] || ['public'];
	return allowedTypes.includes(routeConfig.type);
}

/**
 * Handle redirection for signed-in users
 */
function handleSignedInRedirection(
	pathname: string,
	req: NextRequest,
): NextResponse | null {
	if (REDIRECT_PATHS.includes(pathname)) {
		return NextResponse.redirect(new URL('/', req.url));
	}
	return null;
}

/**
 * Handle signed-in user requests
 */
export function handleSignedInUser(
	userRole: UserRole,
	pathname: string,
	req: NextRequest,
	isOnboardingComplete: boolean,
): NextResponse {
	// First check for signed-in redirections (e.g., /get-started -> /)
	const redirectResponse = handleSignedInRedirection(pathname, req);
	if (redirectResponse) return redirectResponse;

	// Check if user is trying to access a route that requires onboarding
	if (!isOnboardingComplete && pathname !== '/onboarding') {
		if (requiresOnboarding(pathname)) {
			if (process.env.NODE_ENV === 'development') {
				console.log(
					`Redirecting to onboarding from ${pathname} - onboarding not complete`,
				);
			}
			return NextResponse.redirect(new URL('/onboarding', req.url));
		}
	}

	// If user has completed onboarding and is trying to access /onboarding, redirect to home
	if (isOnboardingComplete && pathname === '/onboarding') {
		if (process.env.NODE_ENV === 'development') {
			console.log(
				'User has completed onboarding, redirecting from /onboarding to home',
			);
		}
		return NextResponse.redirect(new URL('/', req.url));
	}

	// Check route accessibility based on role
	if (isRouteAccessibleForRole(pathname, userRole)) {
		return NextResponse.next();
	}

	return NextResponse.redirect(new URL('/not-found', req.url));
}

/**
 * Handle signed-out user requests
 */
export function handleSignedOutUser(
	pathname: string,
	req: NextRequest,
): NextResponse {
	// If signed-out user tries to access /onboarding, redirect to /get-started
	if (pathname === '/onboarding') {
		if (process.env.NODE_ENV === 'development') {
			console.log(
				'Unauthenticated user trying to access /onboarding, redirecting to /get-started',
			);
		}
		const redirectUrl = new URL('/get-started', req.url);
		redirectUrl.searchParams.set('redirectTo', pathname);
		return NextResponse.redirect(redirectUrl);
	}

	const routeConfig = findRouteConfig(pathname);

	// If route is not in config, allow access (let Next.js handle 404)
	if (!routeConfig) {
		return NextResponse.next();
	}

	// Check if route is public
	if (routeConfig.type !== 'public') {
		const redirectUrl = new URL('/get-started', req.url);
		redirectUrl.searchParams.set('redirectTo', pathname);
		return NextResponse.redirect(redirectUrl);
	}

	return NextResponse.next();
}
