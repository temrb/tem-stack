/**
 * Utility type that requires at least one of the specified properties to be defined.
 * This ensures components maintain proper accessibility standards through TypeScript constraints.
 */
export type RequireAtLeastOne<
	T,
	Keys extends keyof T = keyof T,
> = Keys extends keyof T
	? T &
			{
				[K in Keys]-?: Required<Pick<T, K>> &
					Partial<Pick<T, Exclude<Keys, K>>>;
			}[Keys]
	: never;

/**
 * Type definition for ARIA labeling props.
 * Components should provide either aria-label or aria-labelledby for accessibility.
 * This is optional at the TypeScript level but validated at runtime.
 */
export type AriaProps = {
	'aria-label'?: string;
	'aria-labelledby'?: string;
};

/**
 * Type definition for ARIA labeling props that requires at least one labeling method at the type level.
 * Use this when you want TypeScript to enforce ARIA attributes.
 */
export type RequiredAriaProps = RequireAtLeastOne<{
	'aria-label'?: string;
	'aria-labelledby'?: string;
}>;

/**
 * Custom error class for accessibility attribute validation failures.
 * Provides detailed error messages to help identify missing required ARIA attributes.
 */
export class MissingAriaAttributeError extends Error {
	constructor(props: Record<string, unknown>, componentName: string) {
		super(
			`${componentName} component is missing required accessibility attributes. Either 'aria-label' or 'aria-labelledby' must be provided.`,
		);
		this.name = 'MissingAriaAttributeError';

		// Add component context to the error for easier debugging
		Object.defineProperty(this, 'componentName', {
			enumerable: true,
			value: componentName,
		});

		// Add props to error for debugging
		Object.defineProperty(this, 'componentProps', {
			enumerable: true,
			value: props,
		});

		// Capture stack trace for better debugging
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, MissingAriaAttributeError);
		}
	}
}

/**
 * Validates that component props include necessary ARIA attributes.
 *
 * @param props - Component props to validate
 * @param componentName - Name of the component for error reporting
 * @param skipValidation - If true, skips validation (useful for components in FormControl)
 * @returns True if validation passes, false otherwise
 * @throws MissingAriaAttributeError in development environments when validation fails
 */
export function validateAriaProps(
	props: Record<string, unknown>,
	componentName: string,
	skipValidation = false,
): boolean {
	// Skip validation if explicitly requested (e.g., inside FormControl which handles ARIA)
	if (skipValidation) {
		return true;
	}

	const hasAriaLabel = props['aria-label'] !== undefined;
	const hasAriaLabelledBy = props['aria-labelledby'] !== undefined;

	if (!hasAriaLabel && !hasAriaLabelledBy) {
		const error = new MissingAriaAttributeError(props, componentName);

		// Log the error with visual formatting to stand out in console
		console.error(
			`%c🔴 Accessibility Error: ${error.message}`,
			'font-weight: bold; color: #f44336;',
			'\nComponent:',
			componentName,
			'\nProvided props:',
			props,
		);

		// Only throw in development to prevent production crashes
		if (process.env.NODE_ENV !== 'production') {
			throw error;
		}

		return false;
	}

	return true;
}

/**
 * Type guard to check if a component has valid ARIA labeling.
 * Useful for conditional operations based on accessibility compliance.
 */
export function hasValidAriaLabeling(props: Record<string, unknown>): boolean {
	return (
		props['aria-label'] !== undefined ||
		props['aria-labelledby'] !== undefined
	);
}
