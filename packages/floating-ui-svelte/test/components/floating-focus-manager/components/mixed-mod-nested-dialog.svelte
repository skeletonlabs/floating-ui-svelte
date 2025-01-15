<script lang="ts">
	import Dialog from "./mixed-mod-dialog.svelte";
	import { useFloatingParentNodeId } from "../../../../src/index.js";
	import FloatingTree from "../../../../src/components/floating-tree/floating-tree.svelte";
	import type { ComponentProps } from "svelte";

	const parentId = useFloatingParentNodeId();

	let props: ComponentProps<typeof Dialog> = $props();
</script>

{#if parentId == null}
	<FloatingTree>
		<Dialog {...props} />
	</FloatingTree>
{:else}
	<Dialog {...props} />
{/if}
