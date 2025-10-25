import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ModalBody, ModalFooter, ModalHeader } from '@/modals/responsive-modal';
import React from 'react';

interface ModalLayoutProps {
	children?: React.ReactNode;
	title: string;
	description: string;
	displayImage: {
		src?: string;
		alt?: string;
		type?: 'icon' | 'image';
		iconText?: string;
	};
	footer?: React.ReactNode;
	showCloseButton?: boolean;
}

const ModalLayout = (props: ModalLayoutProps) => {
	const {
		title,
		description,
		displayImage,
		children,
		footer,
		showCloseButton = true,
	} = props;

	return (
		<>
			<ModalBody className='space-y-6'>
				<ModalHeader showCloseButton={showCloseButton}>
					<div className='flex flex-col items-center justify-center space-y-1 py-1'>
						{displayImage.type === 'icon' ? (
							<span className='border flex size-10 items-center justify-center rounded-full bg-muted'>
								<h2 className='text-xl font-semibold capitalize'>
									{displayImage.iconText}
								</h2>
							</span>
						) : (
							<Avatar className='size-10'>
								<AvatarImage
									src={displayImage.src as string}
									referrerPolicy='no-referrer'
									className='pointer-events-none'
								/>
								<AvatarFallback>
									{displayImage.alt?.slice(0, 2)}
								</AvatarFallback>
							</Avatar>
						)}
						<h3 className='text-lg font-medium'>{title}</h3>
						<p className='text-center text-xs text-muted-foreground md:text-sm'>
							{description}
						</p>
					</div>
				</ModalHeader>
				{children}
			</ModalBody>

			{footer && <ModalFooter>{footer}</ModalFooter>}
		</>
	);
};

export default ModalLayout;

export type { ModalLayoutProps };
