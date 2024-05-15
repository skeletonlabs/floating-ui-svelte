import { getPlatform } from './get-platform.js';

/**
 * Return true if the current environment is macOS.
 */
export function isMac() {
	return getPlatform().toLowerCase().startsWith('mac') && !navigator.maxTouchPoints;
}
