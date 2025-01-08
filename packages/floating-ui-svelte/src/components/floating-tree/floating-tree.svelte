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

	const addNode = (node: FloatingNodeType) => {
		nodes = [...nodes, node];
	};

	const removeNode = (node: FloatingNodeType) => {
		nodes = nodes.filter((n) => n !== node);
	};

	const events = createPubSub();

	FloatingTreeContext.set({
		addNode,
		removeNode,
		events,
		get nodes() {
			return nodes;
		},
	});
</script>

{@render children?.()}
