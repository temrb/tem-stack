import LoadingSpinner from './loading-spinner';

const PageLoading = () => {
	return (
		<div className='flex h-full w-full items-center justify-center'>
			<LoadingSpinner size={26} />
		</div>
	);
};

export default PageLoading;
