import 'server-only';

import { auth } from './auth';
import { headers } from 'next/headers';

export type Session = typeof auth.$Infer.Session;

export async function getSession(): Promise<Session | null> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});
		return session;
	} catch (error) {
		console.error('Error getting session:', error);
		return null;
	}
}

// Re-export auth instance for direct use
export { auth } from './auth';
