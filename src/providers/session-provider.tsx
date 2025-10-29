'use client';

/**
 * Better Auth doesn't require a provider wrapper
 * The client handles session state internally using nanostores
 * This is kept for compatibility but does nothing
 */
export default function SessionProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
