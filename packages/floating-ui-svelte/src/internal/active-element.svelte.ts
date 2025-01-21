import { BROWSER } from "esm-env";
import { on } from "svelte/events";
import { createSubscriber } from "svelte/reactivity";

const defaultWindow = BROWSER ? window : undefined;

/**
 * Handles getting the active element in a document or shadow root.
 * If the active element is within a shadow root, it will traverse the shadow root
 * to find the active element.
 * If not, it will return the active element in the document.
 *
 * @param document A document or shadow root to get the active element from.
 * @returns The active element in the document or shadow root.
 */
function getActiveElement(document: DocumentOrShadowRoot): Element | null {
	let activeElement = document.activeElement;

	while (activeElement?.shadowRoot) {
		const node = activeElement.shadowRoot.activeElement;
		if (node === activeElement) break;
		activeElement = node;
	}

	return activeElement;
}

interface ActiveElementOptions {
	document?: Document;
	window?: Window;
}

class ActiveElement {
	readonly #document?: DocumentOrShadowRoot;
	readonly #subscribe?: () => void;

	constructor(options: ActiveElementOptions = {}) {
		const { window = defaultWindow, document = window?.document } = options;
		if (window === undefined) return;

		this.#document = document;
		this.#subscribe = createSubscriber((update) => {
			const cleanupFocusIn = on(window, "focusin", update);
			const cleanupFocusOut = on(window, "focusout", update);
			return () => {
				cleanupFocusIn();
				cleanupFocusOut();
			};
		});
	}

	get current(): Element | null {
		this.#subscribe?.();
		if (!this.#document) return null;
		return getActiveElement(this.#document);
	}
}

/**
 * An object holding a reactive value that is equal to `document.activeElement`.
 * It automatically listens for changes, keeping the reference up to date.
 *
 * If you wish to use a custom document or shadowRoot, you should use
 * [useActiveElement](https://runed.dev/docs/utilities/active-element) instead.
 *
 * @see {@link https://runed.dev/docs/utilities/active-element}
 */
const reactiveActiveElement = new ActiveElement();

export { reactiveActiveElement, ActiveElement };
export type { ActiveElementOptions };
