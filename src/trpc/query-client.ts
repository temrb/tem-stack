import { handleTRPCSessionError } from '@/lib/auth/client-session-handler';
import {
	defaultShouldDehydrateQuery,
	QueryClient,
} from '@tanstack/react-query';
import SuperJSON from 'superjson';

export const createQueryClient = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				// With SSR, we usually want to set some default staleTime
				// above 0 to avoid refetching immediately on the client
				staleTime: 30 * 1000,
			},
			mutations: {
				// Default mutation options can be set here
			},
			dehydrate: {
				serializeData: SuperJSON.serialize,
				shouldDehydrateQuery: (query) =>
					defaultShouldDehydrateQuery(query) ||
					query.state.status === 'pending',
			},
			hydrate: {
				deserializeData: SuperJSON.deserialize,
			},
		},
	});

	// Set up global error handling using the QueryCache
	queryClient.getQueryCache().config.onError = (error) => {
		handleTRPCSessionError(error);
	};

	queryClient.getMutationCache().config.onError = (error) => {
		handleTRPCSessionError(error);
	};

	return queryClient;
};
