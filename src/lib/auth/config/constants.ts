/**
 * Time constants for session management (in seconds)
 */
const TIME_IN_SECONDS = {
	ONE_MINUTE: 60,
	ONE_HOUR: 60 * 60,
	ONE_DAY: 60 * 60 * 24,
	ONE_WEEK: 60 * 60 * 24 * 7,
} as const;

/**
 * Session configuration
 */
export const SESSION_CONFIG = {
	/** Session expiration time (7 days) */
	expiresIn: TIME_IN_SECONDS.ONE_WEEK,
	/** How often to update session (1 day) */
	updateAge: TIME_IN_SECONDS.ONE_DAY,
	/** Cookie cache max age (5 minutes) */
	cookieCacheMaxAge: TIME_IN_SECONDS.ONE_MINUTE * 5,
} as const;

/**
 * Default user field values
 */
export const DEFAULT_USER_VALUES = {
	role: 'USER',
	onboardingCompleted: false,
} as const;

/**
 * User role enumeration
 */
export const USER_ROLES = {
	USER: 'USER',
	ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
