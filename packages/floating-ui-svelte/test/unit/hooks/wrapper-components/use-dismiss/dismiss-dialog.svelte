<script lang="ts">
	import type { Snippet } from "svelte";
	import {
		useDismiss,
		useFloating,
		useFloatingNodeId,
		useInteractions,
		type UseDismissOptions,
	} from "../../../../../src/index.js";
	import FloatingNode from "../../../../../src/components/floating-tree/floating-node.svelte";
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";

	let {
		testId,
		children,
		...rest
	}: UseDismissOptions & { testId: string; children: Snippet } = $props();

	let open = $state(true);
	const nodeId = useFloatingNodeId();

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => (open = v),
		nodeId,
	});

	const ints = useInteractions([useDismiss(f.context, rest)]);
</script>

<FloatingNode id={nodeId}>
	<button
		{...ints.getReferenceProps()}
		bind:this={f.reference}
		onclick={() => (open = !open)}>Open</button>
	{#if open}
		<FloatingFocusManager context={f.context}>
			<div
				bind:this={f.floating}
				{...ints.getFloatingProps()}
				data-testid={testId}>
				this is my content here for {testId}

				{@render children()}
			</div>
		</FloatingFocusManager>
	{/if}
</FloatingNode>
