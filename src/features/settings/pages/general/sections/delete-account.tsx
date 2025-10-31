'use client';

import { Button } from '@/components/ui/button';
import { useModals } from '@/hooks/use-modals';

const DeleteAccount = () => {
	const modals = useModals();

	return (
		<Button
			className='w-fit'
			onClick={() => modals.show.deleteAccount({})}
			variant='destructive'
			text='Confirm Delete Account'
			aria-label='Delete Account'
		/>
	);
};

export default DeleteAccount;
