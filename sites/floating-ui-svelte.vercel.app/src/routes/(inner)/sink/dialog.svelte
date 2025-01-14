<script lang="ts">
	import {
		FloatingFocusManager,
		FloatingNode,
		FloatingPortal,
		useClick,
		useDismiss,
		useFloating,
		useFloatingNodeId,
		useInteractions,
	} from "@skeletonlabs/floating-ui-svelte";
	import type { Snippet } from "svelte";

	let {
		open: passedOpen = false,
		reference,
		content,
	}: {
		open?: boolean;
		reference: Snippet<
			[ref: { current: Element | null }, props: Record<string, unknown>]
		>;
		content: Snippet<[close: () => void]>;
	} = $props();

	let open = $state(passedOpen);
	const nodeId = useFloatingNodeId();

	const referenceRef = $state<{ current: Element | null }>({ current: null });

	const floating = useFloating({
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
		nodeId: () => nodeId,
		reference: () => referenceRef.current,
		onReferenceChange: (v) => {
			referenceRef.current = v;
		},
	});

	const ints = useInteractions([
		useClick(floating.context),
		useDismiss(floating.context, { bubbles: false }),
	]);
</script>

<FloatingNode id={nodeId}>
	{@render reference(referenceRef, ints.getReferenceProps())}
	{#if open}
		<FloatingPortal>
			<FloatingFocusManager context={floating.context}>
				<div
					{...ints.getFloatingProps()}
					bind:this={floating.floating}
					class="bg-blue-800 w-48 z-[1000] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
					{@render content(() => (open = false))}
				</div>
			</FloatingFocusManager>
		</FloatingPortal>
	{/if}
</FloatingNode>
