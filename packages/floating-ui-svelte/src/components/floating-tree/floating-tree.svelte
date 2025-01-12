<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { FloatingNodeType } from "../../types.js";
	import { createPubSub } from "../../internal/create-pub-sub.js";
	import { FloatingTreeContext } from "./hooks.svelte.js";

	export interface FloatingTreeProps {
		children?: Snippet;
	}
</script>

<script lang="ts">
	let { children } = $props();

	let nodes: FloatingNodeType[] = $state.raw([]);

	FloatingTreeContext.set({
		addNode: (node: FloatingNodeType) => {
			nodes = [...nodes, node];
		},
		removeNode: (node: FloatingNodeType) => {
			nodes = nodes.filter((n) => n !== node);
		},
		events: createPubSub(),
		get nodes() {
			return nodes;
		},
	});
</script>

{@render children?.()}
