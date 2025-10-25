/**
 * Metadata Data Fetching Utilities (Next.js 15 Pattern)
 *
 * These utilities use React's cache() function to memoize data fetching
 * for metadata generation. This prevents duplicate requests when the same
 * data is needed for both generateMetadata and the page component.
 *
 * PATTERN:
 * 1. Wrap your data fetching function with cache()
 * 2. Use it in both generateMetadata and the page component
 * 3. React will ensure the function only executes once
 *
 * @example
 * ```tsx
 * // Define cached fetcher
 * const getPost = cache(async (slug: string) => {
 *   return await db.post.findUnique({ where: { slug } });
 * });
 *
 * // Use in generateMetadata
 * export async function generateMetadata({ params }: Props) {
 *   const { slug } = await params;
 *   const post = await getPost(slug);
 *   return generateMetadata(createPageMetadata.post(post));
 * }
 *
 * // Use in page component (no duplicate fetch!)
 * export default async function Page({ params }: Props) {
 *   const { slug } = await params;
 *   const post = await getPost(slug);
 *   return <Article post={post} />;
 * }
 * ```
 */

/**
 * Example: Cached job post fetcher
 *
 * Uncomment and adapt when implementing dynamic job pages:
 *
 * ```ts
 * export const getCachedJob = cache(async (jobId: string) => {
 *   const { data, error } = await tryCatch(async () => {
 *     return jobs.job.findUnique({
 *       where: { id: jobId }
 *     });
 *   });
 *
 *   if (error || !data) {
 *     throw new Error('Job not found');
 *   }
 *
 *   return data;
 * });
 * ```
 */

/**
 * Example: Cached user profile fetcher
 *
 * Uncomment and adapt when implementing dynamic profile pages:
 *
 * ```ts
 * export const getCachedUserProfile = cache(async (userId: string) => {
 *   const { data, error } = await tryCatch(async () => {
 *     return site.user.findUnique({
 *       where: { id: userId },
 *       select: {
 *         name: true,
 *         email: true,
 *         image: true,
 *         bio: true,
 *       }
 *     });
 *   });
 *
 *   if (error || !data) {
 *     throw new Error('User not found');
 *   }
 *
 *   return data;
 * });
 * ```
 */

// Placeholder export to prevent empty module errors
export const metadataDataFetchingReady = true;
