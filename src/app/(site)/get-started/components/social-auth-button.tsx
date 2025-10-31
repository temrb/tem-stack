import { Button } from '@/components/ui/button';
import type { ProviderMetadata } from '@/lib/auth/config/providers';
import type { ComponentProps } from 'react';

interface SocialAuthButtonProps {
	provider: ProviderMetadata;
	onClick: () => void;
	disabled?: boolean;
	className?: string;
}

export const SocialAuthButton = ({
	provider,
	onClick,
	disabled = false,
	className,
}: SocialAuthButtonProps) => {
	const Icon = provider.icon;

	return (
		<Button
			disabled={disabled}
			className={className}
			variant='secondary'
			onClick={onClick}
			aria-label={`Continue with ${provider.label}`}
		>
			<span className='flex w-full flex-row items-center justify-center space-x-2'>
				<Icon className='size-6' />
				<p className='text-sm font-normal tracking-wide'>
					Continue with {provider.label}
				</p>
			</span>
		</Button>
	);
};
