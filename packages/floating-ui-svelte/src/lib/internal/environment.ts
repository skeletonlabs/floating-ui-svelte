function getPlatform(): string {
	const uaData = (navigator as { userAgentData?: NavigatorUAData })
		.userAgentData;
	if (uaData?.platform) {
		return uaData.platform;
	}
	return navigator.platform;
}

interface NavigatorUAData {
	brands: Array<{ brand: string; version: string }>;
	mobile: boolean;
	platform: string;
}

function getUserAgent(): string {
	const uaData = (navigator as { userAgentData?: NavigatorUAData })
		.userAgentData;
	if (uaData && Array.isArray(uaData.brands)) {
		return uaData.brands
			.map(({ brand, version }) => `${brand}/${version}`)
			.join(" ");
	}
	return navigator.userAgent;
}

function isMac() {
	return (
		getPlatform().toLowerCase().startsWith("mac") && !navigator.maxTouchPoints
	);
}

function isSafari() {
	// Chrome DevTools does not complain about navigator.vendor
	return /apple/i.test(navigator.vendor);
}

function isAndroid() {
	const re = /android/i;
	return re.test(getPlatform()) || re.test(getUserAgent());
}

function isJSDOM() {
	return getUserAgent().includes("jsdom/");
}

export type { NavigatorUAData };
export { getPlatform, getUserAgent, isMac, isSafari, isAndroid, isJSDOM };
