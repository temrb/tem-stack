import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};

export const formatEnumToTitleCase = (enumValue: string): string => {
	return enumValue
		.toLowerCase()
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

// Sorts object keys recursively to ensure consistent hash
const sortObjectKeys = (obj: any): any => {
	if (typeof obj !== 'object' || obj === null) return obj;
	if (Array.isArray(obj)) return obj.map(sortObjectKeys);
	return Object.keys(obj)
		.sort()
		.reduce((acc, key) => {
			acc[key] = sortObjectKeys(obj[key]);
			return acc;
		}, {} as any);
};

// Re-export utilities
export { hasContent, sortByPosition } from './array';
export { formatDate, formatDateRange, postedDateFormatDate } from './date';
export { default as tryCatch } from './try-catch';
