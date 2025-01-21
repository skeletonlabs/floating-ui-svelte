<script lang="ts">
	import type { ComponentProps } from "svelte";
	import Dialog from "./dialog.svelte";
	import { useFloatingParentNodeId } from "../../../../../src/index.js";
	import FloatingTree from "../../../../../src/components/floating-tree/floating-tree.svelte";

	let props: ComponentProps<typeof Dialog> = $props();

	const parentId = useFloatingParentNodeId();
</script>

{#if parentId == null}
	<FloatingTree>
		<Dialog {...props} />
	</FloatingTree>
{:else}
	<Dialog {...props} />
{/if}
