/**
 * Date formatting utilities for general use across the application
 */

/**
 * Formats a date with customizable options
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string
 */
export const formatDate = (
	date: Date,
	options: Intl.DateTimeFormatOptions = {
		month: 'short',
		year: 'numeric',
	},
): string => {
	return date.toLocaleDateString('en-US', options);
};

/**
 * Formats a date range with start and optional end date
 * @param startDate - Start date
 * @param endDate - End date (optional, defaults to "Present")
 * @param presentLabel - Label to use when endDate is not provided
 * @returns Formatted date range string
 */
export const formatDateRange = (
	startDate: Date,
	endDate?: Date,
	presentLabel: string = 'Present',
): string => {
	const start = formatDate(startDate);
	const end = endDate ? formatDate(endDate) : presentLabel;
	return `${start} - ${end}`;
};

export const postedDateFormatDate = (date: Date): string => {
	const now = new Date();
	const timeDiff = now.getTime() - date.getTime();
	const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in one day
	const oneYear = 365 * oneDay;

	if (timeDiff < oneDay) {
		const hoursAgo = Math.floor(timeDiff / (60 * 60 * 1000));
		const minutesAgo = Math.floor(timeDiff / (60 * 1000));
		const secondsAgo = Math.floor(timeDiff / 1000);

		if (hoursAgo > 0) return `${hoursAgo} hr${hoursAgo > 1 ? 's' : ''}`;
		if (minutesAgo > 0)
			return `${minutesAgo} min${minutesAgo > 1 ? 's' : ''}`;
		return `${secondsAgo} sec${secondsAgo > 1 ? 's' : ''}`;
	}

	const options: Intl.DateTimeFormatOptions = {
		month: 'numeric',
		day: 'numeric',
	};

	if (timeDiff >= oneYear) {
		options.year = 'numeric';
	}

	return date.toLocaleDateString('en-US', options);
};

export const getPreText = (date: Date): string => {
	const now = new Date();
	const timeDiff = now.getTime() - date.getTime();
	const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in one day

	// Use 'on' when the date is not within the last 24 hours
	return timeDiff < oneDay ? '' : ' on';
};

export const formatNumber = (num: number): string => {
	if (num >= 1000000) {
		return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}mil`;
	}
	if (num >= 1000) {
		return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
	}
	return num.toString();
};
