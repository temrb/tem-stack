import SettingsSection from '@/features/settings/components/settings-section';
import DeleteAccount from './sections/delete-account';
import Theme from './sections/theme';

const GeneralSettings = () => {
	return (
		<>
			{/* <SettingsSection
				title='Alias'
				description='Update your alias.'
				children={<UpdateAlias />}
			/> */}
			<SettingsSection
				title='Dark Mode'
				description='Change your theme.'
				children={<Theme />}
			/>
			<SettingsSection
				title='Delete Account'
				description='Delete your account. This action is irreversible.'
				children={<DeleteAccount />}
			/>
		</>
	);
};

export default GeneralSettings;
