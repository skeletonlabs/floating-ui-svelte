<script lang="ts">
	import {
		FloatingTree,
		useFloatingParentNodeId,
	} from "@skeletonlabs/floating-ui-svelte";
	import type { ComponentProps } from "svelte";
	import Dialog from "./dialog.svelte";

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
