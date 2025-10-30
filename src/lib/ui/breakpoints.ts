/**
 * Breakpoint Configuration
 *
 * Single source of truth for responsive breakpoints across the application.
 * These values match Tailwind CSS default breakpoints to ensure consistency
 * between CSS media queries and JavaScript logic.
 *
 * @see https://tailwindcss.com/docs/responsive-design
 */

/**
 * Tailwind CSS default breakpoints (in pixels)
 */
export const BREAKPOINTS = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	'2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Device classification thresholds
 *
 * - Mobile: < 768px (below md breakpoint)
 * - Tablet: >= 768px and < 1024px (md to lg)
 * - Desktop: >= 1024px (lg and above)
 */
export const DEVICE_BREAKPOINTS = {
	mobile: BREAKPOINTS.md, // < 768px
	tablet: BREAKPOINTS.lg, // >= 768px and < 1024px
	desktop: BREAKPOINTS.lg, // >= 1024px
} as const;

/**
 * Creates a media query string for the given breakpoint
 *
 * @param breakpoint - The breakpoint key (sm, md, lg, xl, 2xl)
 * @param type - Whether to use min-width or max-width
 * @returns Media query string for use with window.matchMedia()
 *
 * @example
 * ```ts
 * const isDesktop = window.matchMedia(createMediaQuery('lg', 'min')).matches;
 * const isMobile = window.matchMedia(createMediaQuery('md', 'max')).matches;
 * ```
 */
export const createMediaQuery = (
	breakpoint: Breakpoint,
	type: 'min' | 'max' = 'min',
): string => {
	const width = BREAKPOINTS[breakpoint];
	// For max-width queries, use width - 1 to avoid overlap
	// e.g., max-width: 767px instead of 768px
	const queryWidth = type === 'max' ? width - 1 : width;
	return `(${type}-width: ${queryWidth}px)`;
};

/**
 * Common media query strings for device detection
 */
export const MEDIA_QUERIES = {
	/** Desktop: >= 1024px */
	desktop: createMediaQuery('lg', 'min'),
	/** Mobile: < 768px */
	mobile: createMediaQuery('md', 'max'),
	/** Tablet: >= 768px and < 1024px */
	tablet: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
} as const;
