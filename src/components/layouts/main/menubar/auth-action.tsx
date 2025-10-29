'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SupportButton from '@/components/ui/button/support-button';
import NavMenu from '@/components/ui/nav-menu';
import { signOut, useSession } from '@/lib/auth/auth-client';
import { useLayoutStore } from '@/zustand/ui/useLayoutStore';
import { useRouter } from 'next/navigation';
import { LuBolt, LuLogOut, LuShield } from 'react-icons/lu';

const AuthAction = () => {
	const { data: session, isPending } = useSession();
	const router = useRouter();
	const { setMenubar } = useLayoutStore();
	const admin = session?.user?.role === 'ADMIN';

	const handleSignOut = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push('/');
				},
			},
		});
	};

	if (!isPending && session) {
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
										session?.user?.image ??
										'/default-avatar.png'
									}
									referrerPolicy='no-referrer'
									className='pointer-events-none'
									alt={
										session?.user?.name
											? `${session.user.name}'s avatar`
											: 'User avatar'
									}
								/>
								<AvatarFallback>
									{session?.user?.name
										? session.user.name
												.slice(0, 2)
												.toUpperCase()
										: 'NA'}
								</AvatarFallback>
							</Avatar>
						</button>
					}
					onItemClick={() => setMenubar(false)}
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
							onClick: () => { handleSignOut().catch(console.error); },
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
