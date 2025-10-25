'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Socials } from '@/lib/assets/svg/socials';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

const Auth = () => {
	const searchParams = useSearchParams();
	const redirectTo = searchParams.get('redirectTo');
	const [loading, setLoading] = useState(false);

	return (
		<div className='relative flex h-full w-full items-center justify-center p-2'>
			<Card className='border mx-auto w-full max-w-md shadow-lg'>
				<CardContent className='mx-auto max-w-sm space-y-3 py-6'>
					<Button
						disabled={loading}
						className='h-14 w-full'
						variant='secondary'
						onClick={() => {
							setLoading(true);
							signIn('google', {
								callbackUrl: redirectTo ? `${redirectTo}` : '/',
							}).then(() => setLoading(false));
						}}
						aria-label='Continue with Google'
					>
						<span className='flex w-full flex-row items-center justify-center space-x-2'>
							<Socials.Google className='size-6' />
							<p className='text-sm font-normal tracking-wide'>
								Continue with Google
							</p>
						</span>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};

export default Auth;
