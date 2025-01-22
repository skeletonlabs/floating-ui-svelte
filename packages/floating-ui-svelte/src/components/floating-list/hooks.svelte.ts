import { extract } from "../../internal/extract.js";
import type { MaybeGetter } from "../../types.js";
import { Context } from "../../internal/context.js";
import { watch } from "../../internal/watch.svelte.js";
import { SvelteMap } from "svelte/reactivity";

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

/**
 * Used to register a list item and its index (DOM position) in the
 * `FloatingList`.
 */
function useListItem(opts: UseListItemOptions = {}) {
	const label = $derived(extract(opts.label));
	const listContext = FloatingListContext.getOr({
		elements: [],
		map: new SvelteMap(),
		register: () => {},
		unregister: () => {},
	} as FloatingListContextType);
	let index = $state<number | null>(null);
	let ref = $state<Node | null>(null);

	watch(
		() => ref,
		() => {
			const node = ref;
			return () => {
				if (node) {
					listContext.unregister(node);
				}
			};
		},
	);

	$effect(() => {
		const localIndex = ref ? listContext.map.get(ref) : null;
		if (localIndex != null) {
			index = localIndex;
		}
	});

	return {
		get index() {
			return index == null ? -1 : index;
		},
		get ref() {
			return ref as HTMLElement | null;
		},
		set ref(node: HTMLElement | null) {
			ref = node;
			if (node) {
				listContext.register(node);
			}
			const idx = node ? listContext.map.get(node) : null;
			if (idx === undefined) return;
			if (idx != null) {
				index = idx;
			}
			if (idx === null) return;

			listContext.elements[idx] = node;
			if (listContext.labels) {
				if (label !== undefined) {
					listContext.labels[idx] = label;
				} else {
					listContext.labels[idx] = node?.textContent ?? null;
				}
			}
		},
	};
}

// function useListItem(opts: UseListItemOptions = {})

export { FloatingListContext, useListItem };
export type { UseListItemOptions };
