/**
 * Retrieves the document of the given element.
 * If the element is `null` or `undefined`, the global `document` is returned.
 */
export function getDocument(element?: Element | null) {
	return element?.ownerDocument ?? document;
}
