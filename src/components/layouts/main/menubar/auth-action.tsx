'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SupportButton from '@/components/ui/button/support-button';
import NavMenu from '@/components/ui/nav-menu';
import { signOut, useSession } from 'next-auth/react';
import { LuBolt, LuLogOut, LuShield } from 'react-icons/lu';

const AuthAction = () => {
	const session = useSession();
	const admin = session.data?.user?.role === 'ADMIN';

	const handleSignOut = () => {
		signOut({ callbackUrl: '/' });
	};

	if (session.status === 'authenticated') {
		return (
			<>
				<NavMenu
					trigger={
						<button
							className='cursor-pointer'
							aria-label='Open user menu'
						>
							<Avatar className='size-7'>
								<AvatarImage
									src={
										session?.data?.user?.image ??
										'/default-avatar.png'
									}
									referrerPolicy='no-referrer'
									className='pointer-events-none'
									alt={
										session?.data?.user?.name
											? `${session.data.user.name}'s avatar`
											: 'User avatar'
									}
								/>
								<AvatarFallback>
									{session?.data?.user?.name
										? session.data.user.name
												.slice(0, 2)
												.toUpperCase()
										: 'NA'}
								</AvatarFallback>
							</Avatar>
						</button>
					}
					items={[
						...(admin
							? [
									{
										id: 'admin',
										type: 'link' as const,
										text: 'Admin',
										href: '/admin',
										icon: (
											<LuShield className='size-5 md:size-[1.15rem]' />
										),
									},
								]
							: []),
						{
							id: 'settings',
							type: 'link',
							text: 'Account',
							href: '/settings',
							icon: (
								<LuBolt className='size-5 md:size-[1.15rem]' />
							),
						},
						{
							id: 'sign-out',
							type: 'button',
							text: 'Sign Out',
							onClick: handleSignOut,
							icon: (
								<LuLogOut className='size-5 md:size-[1.15rem]' />
							),
						},
					]}
				/>

				<SupportButton size='icon' variant='ghost' />
			</>
		);
	}
};

export default AuthAction;
