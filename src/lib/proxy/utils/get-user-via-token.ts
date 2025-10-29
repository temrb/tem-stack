import { auth } from '@/lib/auth/auth';
import type { NextRequest } from 'next/server';

interface UserToken {
	sub: string;
	email: string;
	name?: string;
	role?: string;
	alias?: string;
	onboardingCompleted?: boolean;
}

export async function getUserViaToken(
	req: NextRequest,
): Promise<UserToken | null> {
	try {
		const session = await auth.api.getSession({
			headers: req.headers,
		});

		if (!session) {
			return null;
		}

		return {
			sub: session.user.id,
			email: session.user.email,
			name: session.user.name || undefined,
			role: session.user.role ?? undefined,
			alias: session.user.alias ?? undefined,
			onboardingCompleted: session.user.onboardingCompleted ?? undefined,
		};
	} catch {
		return null;
	}
}
