/**
 * Check if the given element is the root element.
 */
export function isRootElement(element: Element): boolean {
	return element.matches('html,body');
}
