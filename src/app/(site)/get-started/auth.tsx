'use client';

import { Card, CardContent } from '@/components/ui/card';
import { PROVIDER_CONFIG } from '@/lib/auth/config/providers';
import { useSearchParams } from 'next/navigation';
import { SocialAuthButton } from './components/social-auth-button';
import { useSignInWithProvider } from './hooks/use-sign-in-with-provider';

const Auth = () => {
	const searchParams = useSearchParams();
	const redirectTo = searchParams.get('redirectTo') || undefined;
	const { signInWithProvider, loading } = useSignInWithProvider(redirectTo);

	return (
		<div className='relative flex h-full w-full items-center justify-center p-2'>
			<Card className='border mx-auto w-full max-w-md shadow-lg'>
				<CardContent className='mx-auto max-w-sm space-y-3 py-6'>
					{PROVIDER_CONFIG.map((provider) => (
						<SocialAuthButton
							key={provider.name}
							provider={provider}
							onClick={() => signInWithProvider(provider.name)}
							disabled={loading}
							className='h-14 w-full'
						/>
					))}
				</CardContent>
			</Card>
		</div>
	);
};

export default Auth;
