import { useEffect, useState } from 'react';

const getDevice = (): 'mobile' | 'tablet' | 'desktop' | null => {
	if (typeof window === 'undefined') return null;

	return window.matchMedia('(min-width: 1024px)').matches
		? 'desktop'
		: window.matchMedia('(min-width: 769px)').matches
			? 'tablet'
			: 'mobile';
};

const getDimensions = () => {
	if (typeof window === 'undefined') return null;

	return { width: window.innerWidth, height: window.innerHeight };
};

export const useMediaQuery = () => {
	const [device, setDevice] = useState<
		'mobile' | 'tablet' | 'desktop' | null
	>(getDevice());
	const [dimensions, setDimensions] = useState<{
		width: number;
		height: number;
	} | null>(getDimensions());

	useEffect(() => {
		const checkDevice = () => {
			setDevice(getDevice());
			setDimensions(getDimensions());
		};

		// Initial detection
		checkDevice();

		// Listener for windows resize
		window.addEventListener('resize', checkDevice);

		// Cleanup listener
		return () => {
			window.removeEventListener('resize', checkDevice);
		};
	}, []);

	return {
		device,
		width: dimensions?.width,
		height: dimensions?.height,
		isMobile: device === 'mobile',
		isTablet: device === 'tablet',
		isDesktop: device === 'desktop',
	};
};
