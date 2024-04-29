import type { Floating } from '../useFloating/index.svelte.js';

interface HoverOptions {
	/**
	 * Enables/disables the hook.
	 * @default true
	 */
	enabled?: boolean;


    mouse?: boolean;
}

class Hover {
	readonly #floating: Floating;
	readonly #options: HoverOptions;

	constructor(floating: Floating, options: HoverOptions = {}) {
		this.#floating = floating;
		this.#options = options;
	}

	get referenceProps() {
		return {};
	}

	get floatingProps() {
		return {};
	}
}

function useHover(floating: Floating, options: HoverOptions = {}): Hover {
	return new Hover(floating, options);
}

export { useHover as useMouse, type HoverOptions as MouseOptions, type Hover as Mouse };
