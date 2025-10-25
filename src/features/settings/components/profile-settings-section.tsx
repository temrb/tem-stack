import type { ProfileSettingsSectionProps } from '../lib/types';

const ProfileSettingsSection = (props: ProfileSettingsSectionProps) => {
	const { title, description, children } = props;

	return (
		<div className='flex flex-col space-y-4'>
			<div className='flex flex-col space-y-1'>
				<h1 className='overflow-hidden truncate font-medium'>
					{title}
				</h1>
				<p className='text-xs text-muted-foreground'>{description}</p>
			</div>
			{children}
		</div>
	);
};

export default ProfileSettingsSection;
