import GeneralLayout from '@/components/layouts/general-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
	return <GeneralLayout>{children}</GeneralLayout>;
}
