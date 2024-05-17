import type { PropertiesHyphen } from 'csstype';

/**
 * Converts a JavaScript object representing CSS styles into a string.
 */
export function styleObjectToString(styleObject: PropertiesHyphen) {
	return Object.entries(styleObject)
		.map(([key, value]) => `${key}: ${value};`)
		.join(' ');
}
