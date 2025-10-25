import { Suspense, type ReactNode } from 'react';
import LoadingSpinner from './ui/loading/loading-spinner';
import PageLoading from './ui/loading/page-loading';

interface SuspenseWrapperProps {
	type?: 'component' | 'page';
	children: ReactNode;
	loadingSize?: number;
	skeleton?: ReactNode;
}

const SuspenseWrapper = ({
	children,
	loadingSize = 16,
	type,
	skeleton,
}: Readonly<SuspenseWrapperProps>) => {
	return (
		<Suspense
			fallback={
				type === 'page' ? (
					<PageLoading />
				) : skeleton ? (
					skeleton
				) : (
					<LoadingSpinner size={loadingSize || 16} />
				)
			}
		>
			{children}
		</Suspense>
	);
};

export default SuspenseWrapper;
