import { cn } from '@/lib/core/utils';

export default function ListItem({
	children,
	className,
	role,
}: {
	children: React.ReactNode;
	className?: string;
	role?: string;
}) {
	return (
		<section
			className={cn(
				'border-t relative flex flex-col space-y-4 p-4 first:border-t-0',
				className,
			)}
			role={role}
		>
			{children}
		</section>
	);
}
