<script lang="ts" module>
	import { type Snippet } from "svelte";
	import { SvelteMap } from "svelte/reactivity";
	import { FloatingListContext } from "./hooks.svelte.js";

	function sortByDocumentPosition(a: Node, b: Node) {
		const position = a.compareDocumentPosition(b);

		if (
			position & Node.DOCUMENT_POSITION_FOLLOWING ||
			position & Node.DOCUMENT_POSITION_CONTAINED_BY
		) {
			return -1;
		}

		if (
			position & Node.DOCUMENT_POSITION_PRECEDING ||
			position & Node.DOCUMENT_POSITION_CONTAINS
		) {
			return 1;
		}

		return 0;
	}

	interface FloatingListProps {
		children: Snippet;

		/**
		 * A reference to the list of HTMLElements, ordered by their index.
		 * `useListNavigation's` `listRef` prop.
		 */
		elements: Array<HTMLElement | null>;

		/**
		 * A ref to the list of element labels, ordered by their index.
		 * `useTypeahead`'s `listRef` prop.
		 */
		labels?: Array<string | null>;
	}
</script>

<script lang="ts">
	let {
		children,
		elements = $bindable(),
		labels,
	}: FloatingListProps = $props();

	let map = new SvelteMap<Node, number | null>();

	function register(node: Node) {
		map.set(node, null);
		const nodes = Array.from(map.keys()).sort(sortByDocumentPosition);
		nodes.forEach((node, index) => {
			map.set(node, index);
		});
	}

	function unregister(node: Node) {
		map.delete(node);
		const nodes = Array.from(map.keys()).sort(sortByDocumentPosition);
		nodes.forEach((node, index) => {
			map.set(node, index);
		});
	}

	FloatingListContext.set({
		elements,
		get labels() {
			return labels;
		},
		map,
		register,
		unregister,
	});
</script>

{@render children()}
