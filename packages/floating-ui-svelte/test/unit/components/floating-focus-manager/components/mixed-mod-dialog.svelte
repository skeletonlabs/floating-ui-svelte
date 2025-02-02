<script lang="ts">
	import type { Snippet } from "svelte";
	import {
		useClick,
		useDismiss,
		useFloating,
		useFloatingNodeId,
		useInteractions,
	} from "../../../../../src/index.js";
	import FloatingNode from "../../../../../src/components/floating-tree/floating-node.svelte";
	import { box } from "../../../../../src/internal/box.svelte.js";
	import FloatingPortal from "../../../../../src/components/floating-portal/floating-portal.svelte";
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";

	let {
		open: controlledOpen,
		modal = true,
		reference,
		sideChildren,
		content,
	}: {
		open?: boolean;
		modal?: boolean;
		content?: Snippet<[() => void]>;
		reference?: Snippet<
			[{ current: Element | null }, Record<string, unknown>]
		>;
		sideChildren?: Snippet;
	} = $props();

	let internalOpen = $state(false);
	const nodeId = useFloatingNodeId();
	const open = $derived(
		controlledOpen !== undefined ? controlledOpen : internalOpen
	);

	const ref = box<Element | null>(null);

	const f = useFloating({
		elements: {
			reference: () => ref.current,
		},
		onReferenceChange: (v) => {
			ref.current = v;
		},
		open: () => open,
		onOpenChange: (v) => {
			internalOpen = v;
		},
		nodeId: () => nodeId,
	});

	const ints = useInteractions([
		useClick(f.context),
		useDismiss(f.context, { bubbles: false }),
	]);
</script>

<FloatingNode id={nodeId}>
	{@render reference?.(ref, ints.getReferenceProps())}
	{#if open}
		<FloatingPortal>
			<FloatingFocusManager context={f.context} {modal}>
				<div
					bind:this={f.elements.floating}
					{...ints.getFloatingProps()}>
					{@render content?.(() => (controlledOpen = false))}
				</div>
			</FloatingFocusManager>
		</FloatingPortal>
	{/if}
	{@render sideChildren?.()}
</FloatingNode>
