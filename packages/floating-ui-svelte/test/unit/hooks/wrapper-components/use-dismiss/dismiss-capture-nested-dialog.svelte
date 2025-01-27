<script lang="ts">
	import type { Snippet } from "svelte";
	import {
		useFloatingParentNodeId,
		type UseDismissOptions,
	} from "../../../../../src/index.js";
	import FloatingTree from "../../../../../src/components/floating-tree/floating-tree.svelte";
	import DismissCaptureDialog from "./dismiss-capture-dialog.svelte";

	let props: UseDismissOptions & { id: string; children?: Snippet } =
		$props();

	const parentId = useFloatingParentNodeId();
</script>

{#if parentId == null}
	<FloatingTree>
		<DismissCaptureDialog {...props} />
	</FloatingTree>
{:else}
	<DismissCaptureDialog {...props} />
{/if}
