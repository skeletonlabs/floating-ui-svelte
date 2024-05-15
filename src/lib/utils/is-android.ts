import { getPlatform } from './get-platform.js';
import { getUserAgent } from './get-user-agent.js';

/**
 * Return true if the current environment is Android.
 */
export function isAndroid() {
	const re = /android/i;
	return re.test(getPlatform()) || re.test(getUserAgent());
}
