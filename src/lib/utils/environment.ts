/**
 * Get the platform of the current environment.
 */
export function getPlatform(): string {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const uaData = (navigator as any).userAgentData as NavigatorUAData | undefined;

	if (uaData?.platform) {
		return uaData.platform;
	}

	return navigator.platform;
}

export interface NavigatorUAData {
	brands: Array<{ brand: string; version: string }>;
	mobile: boolean;
	platform: string;
}

/**
 * Get the user agent of the current environment.
 */
export function getUserAgent(): string {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const uaData = (navigator as any).userAgentData as NavigatorUAData | undefined;

	if (uaData && Array.isArray(uaData.brands)) {
		return uaData.brands.map(({ brand, version }) => `${brand}/${version}`).join(' ');
	}

	return navigator.userAgent;
}

/**
 * Return true if the current environment is macOS.
 */
export function isMac() {
	return getPlatform().toLowerCase().startsWith('mac') && !navigator.maxTouchPoints;
}

/**
 * Check if the browser is Safari.
 */
export function isSafari() {
	// Chrome DevTools does not complain about navigator.vendor
	return /apple/i.test(navigator.vendor);
}

/**
 * Return true if the current environment is Android.
 */
export function isAndroid() {
	const re = /android/i;
	return re.test(getPlatform()) || re.test(getUserAgent());
}

/**
 * Check if the current environment is JSDOM.
 */
export function isJSDOM() {
	return getUserAgent().includes('jsdom/');
}
