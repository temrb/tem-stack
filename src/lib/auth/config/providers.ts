import { Socials } from '@/lib/assets/svg/socials';
import type { ComponentType, SVGProps } from 'react';

/**
 * Provider metadata for UI rendering
 */
export interface ProviderMetadata {
	name: string;
	label: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/**
 * Configuration for each social provider
 * This is the single source of truth for all providers
 */
export const PROVIDER_CONFIG = [
	{
		name: 'google',
		label: 'Google',
		icon: Socials.Google,
	},
] as const satisfies readonly ProviderMetadata[];

/**
 * Type-safe social provider union derived from PROVIDER_CONFIG
 */
export type SocialProvider = (typeof PROVIDER_CONFIG)[number]['name'];

/**
 * List of supported social authentication providers
 * Derived from PROVIDER_CONFIG to maintain single source of truth
 */
export const SOCIAL_PROVIDERS = PROVIDER_CONFIG.map((p) => p.name);

/**
 * Validates if a provider is supported
 */
export function isValidProvider(provider: string): provider is SocialProvider {
	return SOCIAL_PROVIDERS.includes(provider as SocialProvider);
}
