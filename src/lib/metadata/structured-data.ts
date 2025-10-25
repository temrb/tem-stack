import { DEFAULT_METADATA } from './config';

export interface OrganizationStructuredData {
	'@context': 'https://schema.org';
	'@type': 'Organization';
	name: string;
	url: string;
	description: string;
	logo?: string;
	sameAs?: string[];
}

export interface WebSiteStructuredData {
	'@context': 'https://schema.org';
	'@type': 'WebSite';
	name: string;
	url: string;
	description: string;
	potentialAction?: {
		'@type': 'SearchAction';
		target: string;
		'query-input': string;
	};
}

export interface JobPostingStructuredData {
	'@context': 'https://schema.org';
	'@type': 'JobPosting';
	title: string;
	description: string;
	hiringOrganization: {
		'@type': 'Organization';
		name: string;
	};
	jobLocation?: {
		'@type': 'Place';
		address?: string;
	};
	datePosted?: string;
	validThrough?: string;
	employmentType?: string;
	baseSalary?: {
		'@type': 'MonetaryAmount';
		currency: string;
		value: {
			'@type': 'QuantitativeValue';
			value: number | string;
		};
	};
}

export interface BreadcrumbStructuredData {
	'@context': 'https://schema.org';
	'@type': 'BreadcrumbList';
	itemListElement: Array<{
		'@type': 'ListItem';
		position: number;
		name: string;
		item: string;
	}>;
}

export function createOrganizationStructuredData(): OrganizationStructuredData {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: DEFAULT_METADATA.siteName,
		url: DEFAULT_METADATA.siteUrl,
		description: DEFAULT_METADATA.defaultDescription,
		logo: `${DEFAULT_METADATA.siteUrl}/icon?size=512`,
		sameAs: [
			// Add social media links when available
			// 'https://twitter.com/company_handle',
			// 'https://linkedin.com/company/company_handle'
		],
	};
}

export function createWebSiteStructuredData(): WebSiteStructuredData {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: DEFAULT_METADATA.siteName,
		url: DEFAULT_METADATA.siteUrl,
		description: DEFAULT_METADATA.defaultDescription,
		potentialAction: {
			'@type': 'SearchAction',
			target: `${DEFAULT_METADATA.siteUrl}/jobs?q={search_term_string}`,
			'query-input': 'required name=search_term_string',
		},
	};
}

export function createJobPostingStructuredData(jobData: {
	title: string;
	description: string;
	company: string;
	location?: string;
	datePosted?: string;
	validThrough?: string;
	employmentType?: string;
	salary?: {
		currency: string;
		value: number | string;
	};
}): JobPostingStructuredData {
	const structuredData: JobPostingStructuredData = {
		'@context': 'https://schema.org',
		'@type': 'JobPosting',
		title: jobData.title,
		description: jobData.description,
		hiringOrganization: {
			'@type': 'Organization',
			name: jobData.company,
		},
	};

	if (jobData.location) {
		structuredData.jobLocation = {
			'@type': 'Place',
			address: jobData.location,
		};
	}

	if (jobData.datePosted) {
		structuredData.datePosted = jobData.datePosted;
	}

	if (jobData.validThrough) {
		structuredData.validThrough = jobData.validThrough;
	}

	if (jobData.employmentType) {
		structuredData.employmentType = jobData.employmentType;
	}

	if (jobData.salary) {
		structuredData.baseSalary = {
			'@type': 'MonetaryAmount',
			currency: jobData.salary.currency,
			value: {
				'@type': 'QuantitativeValue',
				value: jobData.salary.value,
			},
		};
	}

	return structuredData;
}

export function createBreadcrumbStructuredData(
	breadcrumbs: Array<{ name: string; url: string }>,
): BreadcrumbStructuredData {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: breadcrumbs.map((breadcrumb, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: breadcrumb.name,
			item: `${DEFAULT_METADATA.siteUrl}${breadcrumb.url}`,
		})),
	};
}
