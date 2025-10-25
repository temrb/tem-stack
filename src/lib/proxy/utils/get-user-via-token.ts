import env from '@/env';
import type { JWT } from 'next-auth/jwt';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function getUserViaToken(req: NextRequest): Promise<JWT | null> {
	const session = await getToken({
		req,
		secret: env.NEXTAUTH_SECRET,
	});

	return session;
}
