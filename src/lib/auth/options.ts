import 'server-only';

import env from '@/env';
import type { UserRole } from '@/prisma/site/.generated/enums';
import { site } from '@/trpc/server/site';
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { DefaultSession, NextAuthOptions } from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import type { DefaultJWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
	interface Session extends DefaultSession {
		user: {
			id: string;
			email: string;
			name: string;
			image?: string;
			role?: UserRole;
			alias?: string;
			onboardingCompleted?: boolean;
		} & DefaultSession['user'];
	}

	// interface User {
	//   // ...other properties
	//   // role: UserRole;
	// }
}

declare module 'next-auth/jwt' {
	interface JWT extends DefaultJWT {
		role?: UserRole;
		alias?: string;
		onboardingCompleted?: boolean;
	}
}

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
	pages: {
		signIn: '/get-started',
		error: '/error',
	},
	callbacks: {
		async signIn({ user, account, profile }) {
			if (process.env.NODE_ENV === 'development') {
				console.log(
					'⬇️⬇️⬇️ AUTH DEBUG ⬇️⬇️⬇️',
					{ user, account, profile },
					'⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️',
				);
			}

			if (!user.email) {
				return false;
			}

			if (
				account?.provider === 'google' ||
				account?.provider === 'linkedin'
			) {
				const userExists = await site.user.findUnique({
					where: {
						email: user.email,
					},
					select: {
						id: true,
						name: true,
						image: true,
					},
				});
				// If the user already exists via email, update the user with their name and image from Google
				if (userExists && profile) {
					await site.user.update({
						where: { email: user.email },
						data: {
							...(userExists.name ? {} : { name: profile.name }),
							...(userExists.image
								? {}
								: {
										// @ts-expect-error - this is a bug in the types, `picture` is a valid on the `Profile` type
										image: profile.picture,
									}),
						},
					});
				}
			}

			return true;
		},
		async jwt({ token, account, user, trigger, session }) {
			if (!token.email) {
				return {};
			}

			if (user) {
				token.sub = user.id;
				token.email = user.email;
				token.name = user.name;
				token.picture = user.image;
				// @ts-ignore
				token.role = user.role;
				// @ts-ignore
				token.alias = user.alias;
				// @ts-ignore
				token.onboardingCompleted = user.onboardingCompleted ?? false;
			}

			// Refresh the user's data if they update their name / email
			if (trigger === 'update') {
				const refreshedUser = await site.user.findUnique({
					where: { id: token.sub },
					select: {
						onboardingCompleted: true,
						role: true,
						name: true,
						email: true,
						image: true,
						alias: true,
					},
				});

				if (refreshedUser) {
					token.name = refreshedUser.name;
					token.email = refreshedUser.email;
					token.picture = refreshedUser.image;
					token.role = refreshedUser.role;
					token.alias = refreshedUser.alias;
					token.onboardingCompleted =
						refreshedUser.onboardingCompleted;
				} else {
					return {};
				}
			}

			// Assign role based on the user selection during signup
			if (session?.role) {
				token.role = session.role;
				token.alias = session.alias;
			}
			return token;
		},

		async session({ session, token }) {
			session.user = {
				id: token.sub,
				email: token.email,
				name: token.name,
				image: token.picture,
				role: token.role,
				alias: token.alias,
				// Use onboarding status from token (no need for extra DB call)
				onboardingCompleted: token.onboardingCompleted ?? false,
				// @ts-ignore
				...(token || session).user,
			};

			return session;
		},
	},
	debug: process.env.NODE_ENV === 'development',
	adapter: PrismaAdapter(site) as Adapter,
	session: {
		strategy: 'jwt',
	},
	cookies: {
		sessionToken: {
			name: `${VERCEL_DEPLOYMENT ? '__Secure-' : ''}next-auth.session-token`,
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				domain: VERCEL_DEPLOYMENT
					? `.${env.NEXT_PUBLIC_APP_DOMAIN}`
					: undefined,
				secure: VERCEL_DEPLOYMENT,
			},
		},
	},
	providers: [
		GoogleProvider({
			clientId: env.GOOGLE_CLIENT_ID as string,
			clientSecret: env.GOOGLE_CLIENT_SECRET as string,
			allowDangerousEmailAccountLinking: true,
			profile(profile) {
				return {
					id: profile.sub,
					name: profile.name,
					email: profile.email,
					image: profile.picture,
					role: profile.role ?? 'USER',
				};
			},
		}),

		/**
		 * ...add more providers here.
		 *
		 * Most other providers require a bit more work than the Discord provider. For example, the
		 * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
		 * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
		 *
		 * @see https://next-auth.js.org/providers/github
		 */
	],
};
