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
