import * as z from 'zod';

export const DeleteAccountFormSchema = z.object({
	delete: z
		.string()
		.min(1, 'Confirmation text is required')
		.trim()
		.refine((value) => value.toLowerCase() === 'confirm delete account', {
			message: 'Please type exactly "confirm delete account"',
		}),
	email: z.string().trim().email('Please enter a valid email address'),
});

export const UpdateProfileFormSchema = z.object({
	name: z
		.string()
		.max(100, 'Name must be less than 100 characters')
		.trim()
		.optional(),
});

export const UpdateAliasFormSchema = z.object({
	alias: z
		.string()
		.min(5, 'Alias must be at least 5 characters')
		.max(30, 'Alias cannot exceed 30 characters')
		.regex(
			/^[a-zA-Z0-9_.-]+$/,
			'Alias can only contain letters, numbers, underscores, periods, and hyphens',
		)
		.trim(),
});

export const CheckAliasSchema = z.object({
	alias: z.string(),
});

export const UpdateOnboardingSchema = z.object({
	complete: z.boolean(),
});

// Type exports
export type DeleteAccountFormInput = z.infer<typeof DeleteAccountFormSchema>;
export type UpdateProfileFormInput = z.infer<typeof UpdateProfileFormSchema>;
export type UpdateAliasFormInput = z.infer<typeof UpdateAliasFormSchema>;
export type CheckAliasInput = z.infer<typeof CheckAliasSchema>;
export type UpdateOnboardingInput = z.infer<typeof UpdateOnboardingSchema>;
