import type { SocialProvider } from '@/lib/auth/config/providers';
import { signInSocial } from '@/lib/auth/auth-client';
import { handleTRPCError } from '@/lib/core/errors/error-handler';
import { useCallback, useState } from 'react';

export const useSignInWithProvider = (redirectTo?: string) => {
	const [loading, setLoading] = useState(false);

	const signInWithProvider = useCallback(
		async (provider: SocialProvider) => {
			setLoading(true);
			try {
				await signInSocial({
					provider,
					callbackURL: redirectTo || '/',
				});
			} catch (error) {
				handleTRPCError(error, 'Sign-in failed. Please try again.');
			} finally {
				setLoading(false);
			}
		},
		[redirectTo],
	);

	return { signInWithProvider, loading };
};
