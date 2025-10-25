'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { SettingsRoutes, type SettingsRoutesType } from '@/features/settings/lib/types';
import { formatEnumToTitleCase } from '@/lib/core/utils';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

const SettingsAction = () => {
	const pathname = usePathname();
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const getCurrentRoute = (): SettingsRoutesType => {
		if (pathname === '/settings') return SettingsRoutes.General;

		const routeSegment = pathname.replace('/settings/', '');
		const matchedRoute = Object.values(SettingsRoutes).find(
			(route) => route === routeSegment,
		);

		return matchedRoute ?? SettingsRoutes.General;
	};

	const currentRoute = getCurrentRoute();

	const handleRouteChange = (value: string) => {
		startTransition(() => {
			const route = value as SettingsRoutesType;
			if (route === SettingsRoutes.General) {
				router.push('/settings');
			} else {
				router.push(`/settings/${route}`);
			}
		});
	};

	return (
		<>
			<Select
				value={currentRoute}
				onValueChange={handleRouteChange}
				disabled={isPending}
			>
				<SelectTrigger
					variant='none'
					aria-label='Select a category'
					disabled={isPending}
				>
					<SelectValue
						placeholder='Select a category'
						aria-label='Category Values'
					/>
				</SelectTrigger>
				<SelectContent highZIndex aria-label='Category Options'>
					{Object.values(SettingsRoutes).map((category) => (
						<SelectItem
							key={category}
							value={category}
							aria-label={category}
						>
							{formatEnumToTitleCase(category)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</>
	);
};

export default SettingsAction;
