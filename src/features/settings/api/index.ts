import { createTRPCRouter } from '@/trpc/server/api/site/trpc';
import { generalRouter } from './user';

export const settingsRouter = createTRPCRouter({
	general: generalRouter,
});
