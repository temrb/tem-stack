interface LayoutProps {
	children: React.ReactNode;
}

const LayoutShell = ({ children }: LayoutProps) => {
	return (
		<main className='relative mx-auto flex h-full max-w-screen-2xl flex-1 flex-row overflow-hidden'>
			{children}
		</main>
	);
};

export default LayoutShell;
