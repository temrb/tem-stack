/**
 * Custom implementation of deep strict equality comparison
 * Replaces Node.js util.isDeepStrictEqual for client-side compatibility
 *
 * Handles: primitives, objects, arrays, dates, regexes, sets, maps, NaN, circular references
 * Performance: O(n) object comparison, circular reference protection, early returns
 */
export function isDeepStrictEqual(
	a: unknown,
	b: unknown,
	seen: WeakMap<object, object> = new WeakMap(),
): boolean {
	// Identity check (handles same reference, null, undefined, primitives)
	if (a === b) return true;

	// NaN special case (NaN !== NaN but should be considered equal)
	if (Number.isNaN(a) && Number.isNaN(b)) return true;

	// Type mismatch
	if (typeof a !== typeof b) return false;

	// Null/undefined checks (after type check to avoid redundancy)
	if (a === null || b === null || a === undefined || b === undefined) {
		return false; // Already handled === case above
	}

	// Non-object types that made it here are not equal
	if (typeof a !== 'object') return false;

	// Circular reference protection
	if (seen.has(a as object)) {
		return seen.get(a as object) === b;
	}
	seen.set(a as object, b as object);

	// Handle specific object types
	try {
		// Date objects
		if (a instanceof Date && b instanceof Date) {
			return a.getTime() === b.getTime();
		}

		// RegExp objects
		if (a instanceof RegExp && b instanceof RegExp) {
			return a.source === b.source && a.flags === b.flags;
		}

		// Array comparison
		if (Array.isArray(a) && Array.isArray(b)) {
			if (a.length !== b.length) return false;
			for (let i = 0; i < a.length; i++) {
				if (!isDeepStrictEqual(a[i], b[i], seen)) return false;
			}
			return true;
		}

		// Set comparison
		if (a instanceof Set && b instanceof Set) {
			if (a.size !== b.size) return false;
			for (const value of a) {
				let found = false;
				for (const bValue of b) {
					if (isDeepStrictEqual(value, bValue, seen)) {
						found = true;
						break;
					}
				}
				if (!found) return false;
			}
			return true;
		}

		// Map comparison
		if (a instanceof Map && b instanceof Map) {
			if (a.size !== b.size) return false;
			for (const [key, value] of a) {
				let found = false;
				for (const [bKey, bValue] of b) {
					if (
						isDeepStrictEqual(key, bKey, seen) &&
						isDeepStrictEqual(value, bValue, seen)
					) {
						found = true;
						break;
					}
				}
				if (!found) return false;
			}
			return true;
		}

		// Array type mismatch
		if (Array.isArray(a) || Array.isArray(b)) return false;
		if (a instanceof Set || b instanceof Set) return false;
		if (a instanceof Map || b instanceof Map) return false;
		if (a instanceof Date || b instanceof Date) return false;
		if (a instanceof RegExp || b instanceof RegExp) return false;

		// Plain object comparison with O(n) performance optimization
		const aObj = a as Record<string | symbol, unknown>;
		const bObj = b as Record<string | symbol, unknown>;

		// Get all own enumerable properties (including symbols)
		const aKeys = [
			...Object.keys(aObj),
			...Object.getOwnPropertySymbols(aObj),
		];
		const bKeys = [
			...Object.keys(bObj),
			...Object.getOwnPropertySymbols(bObj),
		];

		if (aKeys.length !== bKeys.length) return false;

		// Create Set for O(1) key lookup instead of O(n) includes()
		const bKeysSet = new Set(bKeys);

		for (const key of aKeys) {
			if (!bKeysSet.has(key)) return false;
			if (!isDeepStrictEqual(aObj[key], bObj[key], seen)) {
				return false;
			}
		}

		return true;
	} catch (error) {
		// Handle edge cases gracefully (e.g., properties that throw on access)
		return false;
	}
}
