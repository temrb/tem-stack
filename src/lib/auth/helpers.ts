import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Hook that provides a function to wrap actions that require authentication.
 * If user is not authenticated, they are redirected to the get-started page
 * with a redirectTo parameter to return them after login.
 *
 * @returns A function that wraps an action with authentication check
 *
 * @example
 * const withAuthCheck = useAuthCheck();
 *
 * const handleLike = () => withAuthCheck(() => {
 *   likeMutation.mutate({ entityId, entityType });
 * });
 */
export const useAuthCheck = () => {
	const { status } = useSession();
	const router = useRouter();

	return useCallback(
		(action: () => void) => {
			if (status !== 'authenticated') {
				const url = new URL('/get-started', window.location.origin);
				url.searchParams.set('redirectTo', window.location.pathname);
				router.push(url.toString());
				return;
			}
			action();
		},
		[status, router],
	);
};
