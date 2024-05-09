import { isHTMLElement, isShadowRoot } from '@floating-ui/utils/dom';

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
		},
	};
}

/**
 * Checks if the pointer type is mouse-like.
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

/**
 * Retrieves the document of the given element.
 * If the element is `null` or `undefined`, the global `document` is returned.
 */
export function getDocument(element?: Element | null) {
	return element?.ownerDocument ?? document;
}

/**
 * Returns a data attribute with the given name.
 */
export function createAttribute(name: string) {
	return `data-floating-ui-${name}`;
}

/**
 * Checks if the child is inside the parent.
 */
export function contains(parent?: Element | null, child?: Element | null) {
	if (!parent || !child) {
		return false;
	}

	const rootNode = child.getRootNode?.();

	// First, attempt with faster native method
	if (parent.contains(child)) {
		return true;
	}

	// then fallback to custom implementation with Shadow DOM support
	if (rootNode && isShadowRoot(rootNode)) {
		let next = child;
		while (next) {
			if (parent === next) {
				return true;
			}
			// @ts-expect-error - `host` can exist
			next = next.parentNode || next.host;
		}
	}

	// Give up, the result is false
	return false;
}

export const TYPEABLE_SELECTOR =
	"input:not([type='hidden']):not([disabled])," +
	"[contenteditable]:not([contenteditable='false']),textarea:not([disabled])";

export function isTypeableElement(element: unknown): boolean {
	return isHTMLElement(element) && element.matches(TYPEABLE_SELECTOR);
}
