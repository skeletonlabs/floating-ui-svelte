<script lang="ts">
	import type { Snippet } from "svelte";
	import FloatingNode from "../../../../../src/components/floating-tree/floating-node.svelte";
	import {
		useClick,
		useDismiss,
		useFloating,
		useFloatingNodeId,
		useInteractions,
		type Boxed,
	} from "../../../../../src/index.js";
	import { box } from "../../../../../src/internal/box.svelte.js";
	import FloatingPortal from "../../../../../src/components/floating-portal/floating-portal.svelte";
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";

	let {
		open: passedOpen = false,
		reference,
		content,
	}: {
		open?: boolean;
		reference: Snippet<
			[ref: Boxed<Element | null>, props: Record<string, unknown>]
		>;
		content: Snippet<[close: () => void]>;
	} = $props();

	let open = $state(passedOpen);
	const nodeId = useFloatingNodeId();

	const referenceRef = box<Element | null>(null);

	const f = useFloating({
		elements: {
			reference: () => referenceRef.current,
		},
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
		nodeId: () => nodeId,
		onReferenceChange: (v) => {
			referenceRef.current = v;
		},
	});

	const ints = useInteractions([
		useClick(f.context),
		useDismiss(f.context, { bubbles: false }),
	]);
</script>

<FloatingNode id={nodeId}>
	{@render reference(referenceRef, ints.getReferenceProps())}
	<FloatingPortal>
		{#if open}
			<FloatingFocusManager context={f.context}>
				<div
					{...ints.getFloatingProps()}
					bind:this={f.elements.floating}>
					{@render content(close)}
				</div>
			</FloatingFocusManager>
		{/if}
	</FloatingPortal>
</FloatingNode>
