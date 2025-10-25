import { type AriaProps, validateAriaProps } from '@/lib/core/types/aria-utils';
import { cn } from '@/lib/core/utils';
import * as React from 'react';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
	AriaProps;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, ...props }, ref) => {
		validateAriaProps(props, 'Textarea');
		return (
			<textarea
				className={cn(
					'border flex min-h-[80px] w-full rounded-md border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-800 dark:bg-stone-950 dark:ring-offset-stone-950 dark:placeholder:text-stone-400 dark:focus-visible:ring-stone-300',
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Textarea.displayName = 'Textarea';

export { Textarea };
