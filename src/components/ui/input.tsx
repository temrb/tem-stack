import { type AriaProps, validateAriaProps } from '@/lib/core/types/aria-utils';
import { cn } from '@/lib/core/utils';
import * as React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & AriaProps;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		validateAriaProps(props, 'Input');
		return (
			<input
				type={type}
				className={cn(
					'border flex h-10 w-full rounded-md border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-800 dark:bg-stone-950 dark:ring-offset-stone-950 dark:placeholder:text-stone-400 dark:focus-visible:ring-stone-300',
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Input.displayName = 'Input';

export { Input };
