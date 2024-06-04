import { isShadowRoot } from '@floating-ui/utils/dom';
import { isAndroid, isJSDOM } from './environment.js';

/**
 * Retrieves the document of the given element.
 * If the element is `null` or `undefined`, the global `document` is returned.
 */
export function getDocument(element?: Element | null) {
	return element?.ownerDocument ?? document;
}

/**
 * Returns the currently focused element in the document.
 */
export function activeElement(doc: Document) {
	let activeElement = doc.activeElement;

	while (activeElement?.shadowRoot?.activeElement != null) {
		activeElement = activeElement.shadowRoot.activeElement;
	}

	return activeElement;
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

/**
 * Check if the pointer event is a virtual event.
 */
export function isVirtualPointerEvent(event: PointerEvent) {
	if (isJSDOM()) {
		return false;
	}
	return (
		(!isAndroid() && event.width === 0 && event.height === 0) ||
		(isAndroid() &&
			event.width === 1 &&
			event.height === 1 &&
			event.pressure === 0 &&
			event.detail === 0 &&
			event.pointerType === 'mouse') ||
		// iOS VoiceOver returns 0.333• for width/height.
		(event.width < 1 &&
			event.height < 1 &&
			event.pressure === 0 &&
			event.detail === 0 &&
			event.pointerType === 'touch')
	);
}

/**
 * Get the target of an event.
 */
export function getTarget(event: Event) {
	if ('composedPath' in event) {
		return event.composedPath()[0];
	}

	// TS thinks `event` is of type never as it assumes all browsers support
	// `composedPath()`, but browsers without shadow DOM don't.
	return (event as Event).target;
}

/**
 * Check if an event target is within a given node.
 */
export function isEventTargetWithin(event: Event, node: Node | null | undefined) {
	if (node == null) {
		return false;
	}

	if ('composedPath' in event) {
		return event.composedPath().includes(node);
	}

	// TS thinks `event` is of type never as it assumes all browsers support composedPath, but browsers without shadow dom don't
	const e = event as Event;
	return e.target != null && node.contains(e.target as Node);
}

/**
 * Check if the given element is the root element.
 */
export function isRootElement(element: Element): boolean {
	return element.matches('html,body');
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
