'use client';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DeleteAccountFormSchema } from '@/features/settings/lib/validation/user.z';
import { createFormErrorHandler } from '@/hooks/useHandleFormError';
import {
	handleTRPCError,
	handleTRPCSuccess,
} from '@/lib/core/errors/error-handler';
import tryCatch from '@/lib/core/utils/try-catch';
import { ModalFooterActions } from '@/modals/modal-footer-actions';
import ModalLayout from '@/modals/modal-layout';
import { api } from '@/trpc/react';
import { useModalStore } from '@/zustand/ui/useModalStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { signOut, useSession } from 'next-auth/react';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

const DeleteAccountModal: React.FC = () => {
	const { data: session } = useSession();
	const { hide } = useModalStore();

	const [isDeleting, setIsDeleting] = useState(false);

	const form = useForm<z.infer<typeof DeleteAccountFormSchema>>({
		resolver: zodResolver(DeleteAccountFormSchema),
		defaultValues: { delete: '', email: '' },
		mode: 'onSubmit',
	});

	const deleteAccountMutation =
		api.settings.general.deleteAccount.useMutation({
			onMutate: () => setIsDeleting(true),
			onSettled: () => setIsDeleting(false),
		});

	const handleSignOut = useCallback(async () => {
		const { error } = await tryCatch(signOut({ callbackUrl: '/' }));

		if (error) {
			console.error('Sign out failed', error);
			handleTRPCError(
				error,
				'Unable to sign out. Please close the browser.',
			);
		}
	}, []);

	const onSubmit = useCallback(
		async (values: z.infer<typeof DeleteAccountFormSchema>) => {
			if (isDeleting) return;

			if (
				values.email.toLowerCase() !==
				session?.user?.email?.toLowerCase()
			) {
				handleTRPCError(
					new Error('Email does not match your account email'),
				);
				return;
			}

			const { data: result, error } = await tryCatch(
				deleteAccountMutation.mutateAsync(values),
			);
			if (error) {
				handleTRPCError(error, 'Failed to delete account');
				return;
			}
			if (result) {
				handleTRPCSuccess('Account deleted successfully!', result);
				hide();
				await handleSignOut();
			}
		},
		[
			deleteAccountMutation,
			handleSignOut,
			isDeleting,
			session?.user?.email,
			hide,
		],
	);

	const formErrorHandler =
		createFormErrorHandler<z.infer<typeof DeleteAccountFormSchema>>();

	if (!session?.user) return null;

	const handleSubmit = () => {
		void form.handleSubmit(onSubmit, formErrorHandler)();
	};

	const footerActions = (
		<ModalFooterActions
			actions={[
				{
					label: 'Cancel',
					onClick: () => hide(),
					variant: 'none',
					disabled: isDeleting,
					'aria-label': 'Cancel and close modal',
					priority: 'secondary',
				},
				{
					label: 'Delete Account',
					onClick: handleSubmit,
					variant: 'destructive',
					disabled: isDeleting,
					loading: isDeleting,
					'aria-label': 'Delete account permanently',
					priority: 'primary',
				},
			]}
		/>
	);

	return (
		<ModalLayout
			title='Delete Account'
			description='This action is irreversible. Confirm your account deletion by typing "confirm delete account" and entering your account email.'
			displayImage={{
				type: 'image',
				src: session?.user?.image || '',
				alt:
					(session?.user?.name ?? 'Avatar').replaceAll(' ', '') ||
					'Avatar',
			}}
			footer={footerActions}
		>
			<Form {...form}>
				<form onSubmit={(e) => e.preventDefault()}>
					<div className='flex flex-col space-y-4 p-4 text-left sm:px-20 md:px-14'>
						<FormField
							control={form.control}
							name='delete'
							render={({ field }) => (
								<FormItem className='space-y-1'>
									<FormDescription className='text-pretty text-left text-xs tracking-normal sm:text-sm'>
										Please type{' '}
										<code className='text-normal py-.5 rounded-sm bg-muted px-1 font-semibold tracking-tighter'>
											confirm delete account
										</code>
									</FormDescription>
									<FormControl>
										<Input
											aria-label='Delete Account'
											type='text'
											{...field}
											autoComplete='off'
											autoFocus
											disabled={isDeleting}
											aria-describedby='delete-account-description'
											aria-invalid={
												!!form.formState.errors.delete
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='email'
							render={({ field }) => (
								<FormItem className='space-y-1'>
									<FormDescription className='text-pretty text-left text-xs tracking-normal sm:text-sm'>
										Please enter your{' '}
										<code className='text-normal py-.5 rounded-sm bg-muted px-1 font-semibold tracking-tighter'>
											account email
										</code>
									</FormDescription>
									<FormControl>
										<Input
											aria-label='Email'
											type='email'
											{...field}
											autoComplete='email'
											disabled={isDeleting}
											aria-describedby='email-confirmation-description'
											aria-invalid={
												!!form.formState.errors.email
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</form>
			</Form>
		</ModalLayout>
	);
};

export default React.memo(DeleteAccountModal);
