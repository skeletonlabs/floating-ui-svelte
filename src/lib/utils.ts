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
 * Creates a simple publish/subscribe system.
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
 * Checks if the given pointer type is mouse-like.
 */
export function isMouseLikePointerType(pointerType: string | undefined, strict?: boolean) {
	// On some Linux machines with Chromium, mouse inputs return a `pointerType`
	// of "pen": https://github.com/floating-ui/floating-ui/issues/2015
	const values: Array<string | undefined> = ['mouse', 'pen'];
	if (!strict) {
		values.push('', undefined);
	}
	return values.includes(pointerType);
}

export function createAttribute(name: string) {
	return `data-floating-ui-${name}`;
}
