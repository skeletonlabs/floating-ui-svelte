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
