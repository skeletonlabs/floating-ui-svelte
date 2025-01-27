<script lang="ts">
	import type { Snippet } from "svelte";
	import {
		useFloatingParentNodeId,
		type UseDismissOptions,
	} from "../../../../../src/index.js";
	import FloatingTree from "../../../../../src/components/floating-tree/floating-tree.svelte";
	import DismissDialog from "./dismiss-dialog.svelte";

	let props: UseDismissOptions & { testId: string; children: Snippet } =
		$props();

	const parentId = useFloatingParentNodeId();
</script>

{#if parentId == null}
	<FloatingTree>
		<DismissDialog {...props} />
	</FloatingTree>
{:else}
	<DismissDialog {...props} />
{/if}
