import { getUserAgent } from './get-user-agent.js';

/**
 * Check if the current environment is JSDOM.
 */
export function isJSDOM() {
	return getUserAgent().includes('jsdom/');
}
