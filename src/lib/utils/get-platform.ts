import type { NavigatorUAData } from './get-user-agent.js';

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
