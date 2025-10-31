'use client';

import PageLoading from '@/components/ui/loading/page-loading';
import { useLayoutStore } from '@/zustand/ui/use-layout-store';
import React from 'react';
import LayoutShell from '../layout-shell';
import Content from './content';
import Footer from './footer';
import Menubar from './menubar';

interface LayoutProps {
	children: React.ReactNode;
}

const MainLayout = ({ children }: LayoutProps) => {
	const { isLoading, menubar } = useLayoutStore();

	return (
		<LayoutShell>
			{isLoading ? (
				<PageLoading />
			) : (
				<>
					{menubar && <Menubar />}
					<Content>{children}</Content>
					<Footer />
				</>
			)}
		</LayoutShell>
	);
};

export default MainLayout;
