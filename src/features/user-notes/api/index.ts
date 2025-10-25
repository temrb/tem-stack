import { createTRPCRouter } from '@/trpc/server/api/site/trpc';
import { userNotesRouter } from './user-notes';

/**
 * User Notes Feature Router
 *
 * This is the main router for the user-notes feature.
 * Add additional routers here as the feature grows.
 */
export const userNotesFeatureRouter = createTRPCRouter({
	main: userNotesRouter,
});
