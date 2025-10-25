export default function GeneralLayout({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return <div className={`h-full w-full p-4 ${className}`}>{children}</div>;
}
