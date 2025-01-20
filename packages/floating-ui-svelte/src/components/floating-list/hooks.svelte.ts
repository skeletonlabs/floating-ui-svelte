import { SvelteMap } from "svelte/reactivity";
import { extract } from "../../internal/extract.js";
import type { MaybeGetter } from "../../types.js";
import { Context } from "../../internal/context.js";
import { watch } from "../../internal/watch.svelte.js";

type FloatingListContextType = {
	register: (node: Node) => void;
	unregister: (node: Node) => void;
	map: SvelteMap<Node, number | null>;
	elements: Array<HTMLElement | null>;
	labels?: Array<string | null>;
};

const FloatingListContext = new Context<FloatingListContextType>(
	"FloatingListContext",
);

interface UseListItemOptions {
	label?: MaybeGetter<string | null>;
}

class ListItemState {
	#label = $derived.by(() => extract(this.opts.label));
	#listContext: FloatingListContextType;
	#index = $state<number | null>(null);
	#ref = $state<Node | null>(null);

	constructor(private readonly opts: UseListItemOptions = {}) {
		this.#listContext = FloatingListContext.getOr({
			register: () => {},
			unregister: () => {},
			map: new SvelteMap(),
			elements: [],
			labels: [],
		});

		$effect(() => {
			console.log("elements in listitemstate", this.#listContext.elements);
			console.log("element0 in listitemstate", this.#listContext.elements[0]);
		});

		watch(
			() => this.#ref,
			() => {
				const node = this.#ref;
				if (node) {
					this.#listContext.register(node);
					return () => {
						this.#listContext.unregister(node);
					};
				}
			},
		);

		$effect.pre(() => {
			const index = this.#ref ? this.#listContext.map.get(this.#ref) : null;
			if (index != null) {
				this.#index = index;
			}
		});
	}

	get index() {
		return this.#index == null ? -1 : this.#index;
	}

	get ref() {
		return this.#ref as HTMLElement | null;
	}

	set ref(node: HTMLElement | null) {
		this.#ref = node;
		const idx = this.#index;
		const label = this.#label;

		if (idx !== null) {
			this.#listContext.elements[idx] = node;
			this.#listContext.elements = this.#listContext.elements;
			if (this.#listContext.labels) {
				if (label !== undefined) {
					this.#listContext.labels[idx] = label;
				} else {
					this.#listContext.labels[idx] = node?.textContent ?? null;
				}
			}
		}
	}
}

/**
 * Used to register a list item and its index (DOM position) in the
 * `FloatingList`.
 */
function useListItem(opts: UseListItemOptions = {}) {
	return new ListItemState(opts);
}

/**
 * Used to register a list item and its index (DOM position) in the
 * `FloatingList`.
 */

// function useListItem(opts: UseListItemOptions = {})

export { FloatingListContext, useListItem, ListItemState };
export type { UseListItemOptions };
