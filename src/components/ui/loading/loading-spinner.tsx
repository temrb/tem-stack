import { cn } from '@/lib/core/utils';

interface Props {
	size: number;
	className?: string;
	textNormal?: boolean | false;
}

const LoadingSpinner = (props: Props) => {
	const { size, textNormal, className } = props;
	return (
		<svg
			className={cn(
				'animate-spin ease-in-out',
				!textNormal && 'text-foreground',
				className,
			)}
			xmlns='http://www.w3.org/2000/svg'
			fill='none'
			viewBox='0 0 350 350'
			height={size}
			width={size}
		>
			<circle
				className='opacity-55'
				r='130'
				stroke='currentColor'
				cx='175'
				cy='175'
				fill='none'
				strokeWidth='80'
				strokeDasharray='455'
				strokeLinecap='round'
				strokeDashoffset='-52'
			/>
		</svg>
	);
};

export default LoadingSpinner;
