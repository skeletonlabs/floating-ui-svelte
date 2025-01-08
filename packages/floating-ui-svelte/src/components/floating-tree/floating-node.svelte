<script lang="ts" module>
	import type { Snippet } from "svelte";
	import {
		FloatingNodeContext,
		useFloatingParentNodeId,
	} from "./hooks.svelte.js";

	export interface FloatingNodeProps {
		children?: Snippet;
		id: string | undefined;
	}
</script>

<script lang="ts">
	let { children, id } = $props();

	const parentId = useFloatingParentNodeId();

	FloatingNodeContext.set({
		get id() {
			return id;
		},
		get parentId() {
			return parentId;
		},
	});
</script>

{@render children?.()}
