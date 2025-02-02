<script lang="ts">
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import {
		useClick,
		useFloating,
		useInteractions,
	} from "../../../../../src/index.js";

	let { restoreFocus = true }: { restoreFocus?: boolean } = $props();

	let open = $state(false);
	let removedIndex = $state(0);

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
	});

	const ints = useInteractions([useClick(f.context)]);
</script>

<button
	bind:this={f.elements.reference}
	{...ints.getReferenceProps()}
	data-testid="reference">ref</button>
{#if open}
	<FloatingFocusManager context={f.context} initialFocus={1} {restoreFocus}>
		<div
			bind:this={f.elements.floating}
			{...ints.getFloatingProps()}
			data-testid="floating">
			{#if removedIndex < 3}
				<button onclick={() => (removedIndex = removedIndex + 1)}>
					three
				</button>
			{/if}
			{#if removedIndex < 1}
				<button onclick={() => (removedIndex = removedIndex + 1)}>
					one
				</button>
			{/if}
			{#if removedIndex < 2}
				<button onclick={() => (removedIndex = removedIndex + 1)}>
					two
				</button>
			{/if}
		</div>
	</FloatingFocusManager>
{/if}
