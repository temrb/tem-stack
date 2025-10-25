'use client';

import { type AriaProps, validateAriaProps } from '@/lib/core/types/aria-utils';
import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import type { ReactNode } from 'react';
import React, { useMemo } from 'react';

export type CustomLinkProps = NextLinkProps &
	AriaProps & {
		className?: string;
		newTab?: boolean;
		children: ReactNode;
		ref?: React.Ref<HTMLAnchorElement>;
	};

/**
 * A simplified wrapper around Next.js's Link component.
 * It primarily handles the logic for opening links in a new tab.
 * Updated for React 19: ref is now a standard prop instead of using forwardRef.
 */
const Link = (props: CustomLinkProps) => {
	const {
		children,
		newTab,
		className,
		prefetch = false,
		ref,
		...rest
	} = props;

	validateAriaProps(rest, 'Link');

	const newTabProps = useMemo(() => {
		return newTab
			? {
					target: '_blank',
					rel: 'noopener noreferrer',
				}
			: {};
	}, [newTab]);

	return (
		<NextLink
			{...rest}
			{...newTabProps}
			prefetch={prefetch}
			className={className}
			ref={ref}
		>
			{children}
		</NextLink>
	);
};

Link.displayName = 'Link';

export default Link;
