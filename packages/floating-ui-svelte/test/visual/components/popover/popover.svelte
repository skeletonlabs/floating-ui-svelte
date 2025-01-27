<script lang="ts">
	import FloatingTree from "../../../../src/components/floating-tree/floating-tree.svelte";
	import { useFloatingParentNodeId } from "../../../../src/index.js";
	import type { PopoverImplProps } from "./popover-impl.svelte";
	import PopoverImpl from "./popover-impl.svelte";

	let props: PopoverImplProps = $props();

	const parentId = useFloatingParentNodeId();
</script>

<!-- This is a root, so we wrap it with the tree -->
{#if parentId === null}
	<FloatingTree>
		<PopoverImpl {...props} />
	</FloatingTree>
{:else}
	<PopoverImpl {...props} />
{/if}
