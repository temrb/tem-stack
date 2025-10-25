import React from 'react';
import ListItem from '../../../components/layouts/list-item';

interface ProfileSettingsLayoutProps {
	children: React.ReactNode;
}

const ProfileSettingsLayout = (props: ProfileSettingsLayoutProps) => {
	return <ListItem>{props.children}</ListItem>;
};

export default ProfileSettingsLayout;
