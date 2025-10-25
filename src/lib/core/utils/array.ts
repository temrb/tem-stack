/**
 * Generic array and object utilities for use across the application
 */

/**
 * Interface for items that can be positioned
 */
interface Positionable {
	position?: number;
}

/**
 * Sorts an array of items by their position property
 * Items without position default to position 0
 * @param items - Array of items with optional position property
 * @returns Sorted array by position (ascending)
 */
export const sortByPosition = <T extends Positionable>(items: T[]): T[] => {
	return [...items].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
};

/**
 * Validates if an array has content to display
 * @param items - Array of items to check
 * @returns True if array has displayable content
 */
export const hasContent = <T>(items?: T[]): items is T[] => {
	return Array.isArray(items) && items.length > 0;
};
