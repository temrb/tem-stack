import 'server-only';

import type { UserRole } from '@/prisma/site/.generated/enums';
import type { ISODateString } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './options';

export interface Session {
	user: {
		id: string;
		email: string;
		name: string;
		image?: string;
		role?: UserRole;
		alias?: string;
		onboardingCompleted?: boolean;
	};
	expires: ISODateString;
}

export const getSession = async () => {
	return getServerSession(authOptions) as Promise<Session>;
};
