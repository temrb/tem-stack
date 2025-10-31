import { useEffect, useRef } from 'react';

interface UseKeyboardShortcutOptions {
	enabled?: boolean;
	preventDefault?: boolean;
	stopPropagation?: boolean;
}

export const useKeyboardShortcut = (
	key: string | string[],
	callback: (e: KeyboardEvent) => void,
	options: UseKeyboardShortcutOptions = {},
) => {
	const {
		enabled = true,
		preventDefault = true,
		stopPropagation = true,
	} = options;

	const callbackRef = useRef(callback);
	callbackRef.current = callback;

	useEffect(() => {
		if (!enabled) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement;
			const isTyping =
				target.tagName === 'INPUT' ||
				target.tagName === 'TEXTAREA' ||
				target.contentEditable === 'true' ||
				target.hasAttribute('data-cmdk-input');

			if (isTyping) return;

			const keys = Array.isArray(key) ? key : [key];
			if (keys.includes(event.key)) {
				if (preventDefault) event.preventDefault();
				if (stopPropagation) event.stopPropagation();
				callbackRef.current(event);
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [key, enabled, preventDefault, stopPropagation]);
};

export const formatShortcut = (key: string | string[]): string => {
	const firstKey = Array.isArray(key) ? key[0] : key;
	if (!firstKey) return '';

	if (firstKey === ' ') return 'Space';
	if (firstKey === 'Enter') return '⏎';
	if (firstKey === 'Escape') return 'Esc';
	if (firstKey === 'ArrowUp') return '↑';
	if (firstKey === 'ArrowDown') return '↓';
	if (firstKey === 'ArrowLeft') return '←';
	if (firstKey === 'ArrowRight') return '→';

	if (firstKey.length === 1) {
		return firstKey.toUpperCase();
	}

	return firstKey;
};
