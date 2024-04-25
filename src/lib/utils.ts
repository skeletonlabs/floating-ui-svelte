/**
 * Retrieves the device pixel ratio (DPR) of the current environment.
 */
export function getDPR(element: Element): number {
	if (typeof window === 'undefined') {
		return 1;
	}
	const win = element.ownerDocument.defaultView || window;
	return win.devicePixelRatio || 1;
}

/**
 * Rounds a value taking into account the device pixel ratio (DPR).
 */
export function roundByDPR(element: Element, value: number) {
	const dpr = getDPR(element);
	return Math.round(value * dpr) / dpr;
}

/**
 * Converts a JavaScript object representing CSS styles into a string.
 */
export function styleObjectToString(styleObject: Partial<ElementCSSInlineStyle['style']>) {
	return Object.entries(styleObject)
		.map(([key, value]) => `${key}: ${value};`)
		.join(' ');
}

/**
 * Returns wether a value is a function.
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
	return typeof value === 'function';
}

/**
 * Returns wether a value is an object.
 */
export function isObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object';
}
