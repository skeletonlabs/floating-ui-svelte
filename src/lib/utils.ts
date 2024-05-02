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
 * A function that does nothing.
 * Useful as a default value for optional callbacks.
 */
export function noop() {}

/**
 * A function that creates a simple publish/subscribe mechanism.
 */
export function createPubSub() {
	const map = new Map<string, Array<(data: unknown) => void>>();

	return {
		emit(event: string, data: unknown) {
			map.get(event)?.forEach((handler) => handler(data));
		},
		on(event: string, listener: (data: unknown) => void) {
			map.set(event, [...(map.get(event) || []), listener]);
		},
		off(event: string, listener: (data: unknown) => void) {
			map.set(event, map.get(event)?.filter((l) => l !== listener) || []);
		}
	};
}

/**
 * Generates a unique identifier.
 */
export function generateId() {
	return `floating-ui-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Converts an object of key/values to a style attribute string.
 */
export function styleParser(obj: any) {
	return Object.keys(obj)
		.map((k) => `${k}: ${obj[k]}`)
		.join(';');
}
