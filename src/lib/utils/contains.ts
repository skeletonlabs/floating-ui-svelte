import { isShadowRoot } from '@floating-ui/utils/dom';

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
