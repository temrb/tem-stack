/**
 * Enum representing all possible setting pages.
 * The enum values correspond to actual route paths.
 */

export const SettingsRoutes = {
	General: 'GENERAL',
} as const;

export type SettingsRoutesType = typeof SettingsRoutes[keyof typeof SettingsRoutes];
