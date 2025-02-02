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
	import FloatingPortal from "../../../../../src/components/floating-portal/floating-portal.svelte";
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";

	let {
		id,
		children,
		...rest
	}: UseDismissOptions & { id: string; children?: Snippet } = $props();

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
	<button bind:this={f.elements.reference} {...ints.getReferenceProps()}
		>open</button>
	{#if open}
		<FloatingPortal>
			<FloatingFocusManager context={f.context}>
				<div
					bind:this={f.elements.floating}
					{...ints.getFloatingProps()}>
					<span>{id}</span>
					{@render children?.()}
				</div>
			</FloatingFocusManager>
		</FloatingPortal>
	{/if}
</FloatingNode>
