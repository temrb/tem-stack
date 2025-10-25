'use client';
import Link from '@/components/ui/link';
import env from '@/env';
import { cn } from '@/lib/core/utils';
import { Comfortaa } from 'next/font/google';
import { usePathname } from 'next/navigation';

const comfortaa = Comfortaa({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-comfortaa',
});

interface LogoProps {
	textOnly?: boolean;
	style: 'gradient' | 'solid' | 'fullText';
	/**
	 *  size should be a tailwind size class that starts with 'size-' e.g., 'size-8', 'size-10', etc.
	 *  If no size is provided, default 'size-8' will be used.
	 */
	size?: `size-${number}` | `size-${string}`; // Enforce 'size-' prefix for string sizes
	className?: string;
}

const Logo = ({ textOnly = false, style, size, className }: LogoProps) => {
	const pathname = usePathname();

	if (pathname === '/' || textOnly) {
		return <LogoItem style={style} size={size} />;
	}

	return (
		<Link
			href='/'
			className={cn('flex items-center', className)}
			aria-label={`${env.NEXT_PUBLIC_APP_NAME}`}
		>
			<LogoItem style={style} size={size} />
		</Link>
	);
};

export default Logo;

const LogoItem = ({ style, size }: LogoProps) => {
	// Function to determine text size based on logo size
	const getTextSizeClass = (
		logoSize?: `size-${number}` | `size-${string}`,
	) => {
		if (!logoSize) {
			return 'text-xl'; // Default text size if no logoSize is provided or for default size-8
		}

		const sizeValue = parseInt(logoSize.replace('size-', ''), 10);

		if (isNaN(sizeValue)) {
			return 'text-xl'; // Default text size if parsing fails or for non-numeric size values (unlikely with type enforcement)
		}

		if (sizeValue <= 6) {
			return 'text-sm';
		} else if (sizeValue <= 8) {
			return 'text-xl'; // or text-md if you prefer slightly larger default
		} else if (sizeValue <= 12) {
			return 'text-2xl';
		} else {
			return 'text-3xl'; // For larger sizes, you can scale up further text-2xl, text-3xl etc.
		}
	};

	const textSizeClass = getTextSizeClass(size);

	return (
		<span
			className={cn(
				comfortaa.className,
				'animate flex transition-colors duration-300 ease-in-out',
				style === 'gradient' &&
					'bg-gradient-to-tr from-muted-foreground to-background shadow-sm dark:shadow-none',
				style === 'solid' && 'bg-foreground text-background',
				style !== 'fullText' &&
					'aspect-square items-center justify-center rounded-full', // Removed text-xl here
				size ? size : 'size-8', // Still use size for logo container size
			)}
		>
			<p
				className={cn(
					'font-bold',
					textSizeClass, // Dynamically apply text size class
					style === 'fullText' && 'whitespace-nowrap text-lg', // text-lg for fullText style
				)}
			>
				{style !== 'fullText'
					? env.NEXT_PUBLIC_APP_NAME?.slice(0, 1)
					: env.NEXT_PUBLIC_APP_NAME}
			</p>
		</span>
	);
};
