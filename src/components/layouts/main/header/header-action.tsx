'use client';
import SuspenseWrapper from '@/components/suspense-wrapper';
import Logo from '@/components/ui/logo';
import { normalizeRouteMatcher } from '@/lib/ui/header-actions';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import ActionLayout from './header-actions/action-layout';
import { headerActionRegistry } from './header-actions/registry';

const HeaderAction = () => {
	const session = useSession();
	const authenticated = session.status === 'authenticated';
	const pathname = usePathname();

	if (pathname.startsWith('/get-started')) {
		return <Logo textOnly style='solid' className='ml-auto' />;
	}

	// AUTHENTICATED USER ACTIONS
	if (authenticated) {
		// Find the first matching header action from the registry
		for (const [key, definition] of Object.entries(headerActionRegistry)) {
			const routeMatcher = normalizeRouteMatcher(
				definition.config.routeMatcher,
			);

			if (routeMatcher(pathname)) {
				const { Component } = definition;

				return (
					<SuspenseWrapper>
						<ActionLayout>
							<Component />
						</ActionLayout>
					</SuspenseWrapper>
				);
			}
		}
	}

	// UNAUTHENTICATED USER ACTIONS
};

export default HeaderAction;
