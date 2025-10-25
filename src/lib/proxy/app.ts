// app.ts
import { UserRole } from '@/prisma/site/.generated/enums';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { handleSignedInUser, handleSignedOutUser } from './helpers';
import { getUserViaToken } from './utils';
import {
	handleInvalidSession,
	requiresAuthentication,
	validateProxySession,
} from './utils/session-handler';

interface UserState {
	isAuthenticated: boolean;
	isOnboardingComplete: boolean;
	role?: UserRole;
}

/**
 * Extract user authentication and onboarding state from JWT token
 */
async function getUserState(req: NextRequest): Promise<UserState> {
	const token = await getUserViaToken(req);

	return {
		isAuthenticated: !!token,
		isOnboardingComplete: token?.onboardingCompleted === true,
		role: token?.role as UserRole | undefined,
	};
}

export default async function proxy(req: NextRequest) {
	const { pathname } = req.nextUrl;
	const isDevelopment = process.env.NODE_ENV === 'development';

	// Handle admin routes
	if (pathname.startsWith('/admin')) {
		if (isDevelopment) {
			console.log(
				`Admin route detected: ${pathname}, env: ${process.env.NODE_ENV}`,
			);
		}

		// Only allow admin routes in development environments
		if (!isDevelopment) {
			if (isDevelopment) {
				console.warn(
					'Admin routes are only available in development environments',
				);
			}
			return NextResponse.redirect(new URL('/not-found', req.url));
		}

		// Validate session for admin routes
		const sessionResult = await validateProxySession(req);

		// Handle invalid session
		if (!sessionResult.isValid) {
			if (isDevelopment) {
				console.warn(`Invalid session for admin route: ${pathname}`);
			}
			return handleInvalidSession(req, sessionResult);
		}

		// Check authorization
		if (sessionResult.user?.role !== UserRole.ADMIN) {
			if (isDevelopment) {
				console.warn(
					`Unauthorized access attempt to admin route by ${sessionResult.user?.role} user: ${pathname}`,
				);
			}
			return NextResponse.redirect(new URL('/not-found', req.url));
		}

		if (isDevelopment) {
			console.log(`Admin access granted to ${pathname}`);
		}
		return NextResponse.next();
	}

	// For protected routes, validate session integrity
	if (requiresAuthentication(pathname)) {
		const sessionResult = await validateProxySession(req);

		if (!sessionResult.isValid && sessionResult.shouldRedirect) {
			// Session is invalid and needs cleanup/redirect
			if (isDevelopment) {
				console.warn(
					`Invalid session detected for protected route: ${pathname}`,
				);
			}
			return handleInvalidSession(req, sessionResult);
		}
	}

	// Continue with existing authentication flow
	const userState = await getUserState(req);

	// Handle other routes
	if (userState.isAuthenticated && userState.role) {
		return handleSignedInUser(
			userState.role,
			pathname,
			req,
			userState.isOnboardingComplete,
		);
	}

	return handleSignedOutUser(pathname, req);
}
