interface ActionLayoutProps {
	children: React.ReactNode;
}

const ActionLayout = ({ children }: Readonly<ActionLayoutProps>) => {
	return (
		<div className='flex flex-shrink-0 flex-row items-center justify-end space-x-3 md:space-x-4'>
			{children}
		</div>
	);
};

export default ActionLayout;
