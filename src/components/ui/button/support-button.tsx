import env from '@/env';
import { cn } from '@/lib/core/utils';
import type { ReactNode } from 'react';
import { LuLifeBuoy } from 'react-icons/lu';
import { Button } from '.';
import type { ButtonProps } from './lib/types';

interface SupportButtonProps {
	variant?: ButtonProps['variant'];
	size?: ButtonProps['size'];
	text?: string;
	showIcon?: boolean;
	icon?: ReactNode;
	className?: string;
	disabled?: boolean;
}

const SupportButton = ({
	variant = 'ghost',
	size = 'default',
	text = 'Support',
	showIcon = true,
	icon,
	className,
	disabled = false,
}: SupportButtonProps) => {
	const shouldShowIcon = showIcon || size === 'icon';
	const displayIcon = icon ?? <LuLifeBuoy className='size-4' />;

	return (
		<Button
			href={env.NEXT_PUBLIC_FEATUREBASE_URL}
			newTab
			variant={variant}
			size={size}
			className={cn(className, size !== 'icon' && 'h-fit w-fit')}
			disabled={disabled}
			icon={shouldShowIcon ? displayIcon : undefined}
			iconPosition='left'
			aria-label={size === 'icon' ? 'Get Support' : text}
			tooltipContent={
				<p className='text-sm'>Get support or request features!</p>
			}
			tooltipSide='top'
		>
			{size === 'icon' ? undefined : text}
		</Button>
	);
};

export default SupportButton;
