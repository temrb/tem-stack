import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getSession } from '@/lib/auth';
import ModalProvider from '@/modals/modal-provider';
import { TRPCReactProvider } from '@/trpc/react';
import SessionProvider from './session-provider';
import { ThemeProvider } from './theme-provider';

export const Providers = async ({
	children,
}: Readonly<{ children: React.ReactNode }>) => {
	const session = await getSession();
	return (
		<ThemeProvider
			attribute='class'
			defaultTheme='light'
			enableSystem
			disableTransitionOnChange
		>
			<TRPCReactProvider>
				<SessionProvider session={session}>
					<TooltipProvider>{children}</TooltipProvider>
					<ModalProvider />
				</SessionProvider>
				<Toaster />
			</TRPCReactProvider>
		</ThemeProvider>
	);
};

export default Providers;
