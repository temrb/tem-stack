import ListItem from '@/components/layouts/list-item';
import type { ProfileSettingsSectionProps } from '../lib/types';

const SettingsSection = ({
	title,
	description,
	children,
}: ProfileSettingsSectionProps) => {
	return (
		<ListItem>
			<div className='flex h-full w-full flex-col'>
				<h3 className='text-lg font-semibold'>{title}</h3>
				<p className='text-sm text-muted-foreground'>{description}</p>
			</div>
			<div className='w-full'>{children}</div>
		</ListItem>
	);
};

export default SettingsSection;
