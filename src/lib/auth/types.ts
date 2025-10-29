import type { auth } from './auth';

/**
 * Better Auth automatically infers types from additionalFields config
 *
 * The custom fields (role, alias, onboardingCompleted) defined in
 * src/lib/auth/auth.ts will be automatically available on the Session type
 * through Better Auth's $Infer mechanism.
 */

// Export the inferred session type from our auth config
export type Session = typeof auth.$Infer.Session;

// Export a convenient User type that includes all fields
export type AuthUser = Session['user'];
