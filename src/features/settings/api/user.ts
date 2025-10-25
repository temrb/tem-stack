import {
	createTRPCRouter,
	protectedProcedure,
} from '@/trpc/server/api/site/trpc';
import {
	CheckAliasSchema,
	DeleteAccountFormSchema,
	UpdateAliasFormSchema,
	UpdateOnboardingSchema,
} from '../lib/validation/user.z';
import {
	checkAlias as checkAliasAvailability,
	checkUserOnboarding,
	deleteUserAccount,
	updateUserAlias,
	updateUserOnboarding,
} from './services/user.service';

const updateAlias = protectedProcedure
	.input(UpdateAliasFormSchema)
	.mutation(async ({ ctx, input }) => {
		return updateUserAlias(ctx.session.user.id, input);
	});

const checkAlias = protectedProcedure
	.input(CheckAliasSchema)
	.query(async ({ ctx, input }) => {
		return checkAliasAvailability(input.alias, ctx.session.user.id);
	});

const deleteAccount = protectedProcedure
	.input(DeleteAccountFormSchema)
	.mutation(async ({ ctx, input }) => {
		return deleteUserAccount(ctx.session.user.id, input);
	});

const checkOnboarding = protectedProcedure.query(async ({ ctx }) => {
	return checkUserOnboarding(ctx.session.user.id);
});

const updateOnboarding = protectedProcedure
	.input(UpdateOnboardingSchema)
	.mutation(async ({ ctx, input }) => {
		return updateUserOnboarding(ctx.session.user.id, input.complete);
	});

export const generalRouter = createTRPCRouter({
	updateAlias,
	checkAlias,
	deleteAccount,
	checkOnboarding,
	updateOnboarding,
});
