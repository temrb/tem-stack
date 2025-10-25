/**
 * Metadata System
 *
 * A simplified metadata system following Next.js 15 best practices.
 *
 * ## Architecture
 *
 * - **Root Layout** (`src/app/layout.tsx`): Defines default metadata for all pages
 * - **Page-Level Metadata**: Each page.tsx defines its own metadata inline
 * - **Global Utilities**: This directory provides shared constants and specialized helpers
 *
 * ## Usage
 *
 * Define metadata directly in page files using Next.js native Metadata type:
 *
 * ```tsx
 * import type { Metadata } from 'next';
 *
 * export const metadata: Metadata = {
 *   title: 'Page Title',
 *   description: 'Page description',
 *   robots: { index: true, follow: true }
 * };
 * ```
 *
 * For dynamic metadata:
 *
 * ```tsx
 * export async function generateMetadata({ params }): Promise<Metadata> {
 *   const data = await fetchData(params.id);
 *   return {
 *     title: data.title,
 *     description: data.description
 *   };
 * }
 * ```
 */

// Configuration and constants
export { DEFAULT_METADATA, METADATA_PATHS, SOCIAL_IMAGE_SIZES } from './config';

// Specialized utilities for advanced use cases
export {
	createBreadcrumbStructuredData,
	createJobPostingStructuredData,
	createOrganizationStructuredData,
	createWebSiteStructuredData,
} from './structured-data';
