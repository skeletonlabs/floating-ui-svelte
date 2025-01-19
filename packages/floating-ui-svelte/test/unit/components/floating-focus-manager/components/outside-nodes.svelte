<script lang="ts">
	import { useFloating } from "../../../../../src/index.js";
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";

	let {
		outsideElementsInert = false,
		modal = true,
	}: { outsideElementsInert?: boolean; modal?: boolean } = $props();

	let open = $state(false);

	const floating = useFloating({
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
	});
</script>

<input
	data-testid="reference"
	bind:this={floating.reference}
	onclick={() => (open = !open)} />
<div>
	<div data-testid="aria-live" aria-live="polite"></div>
	<button data-testid="btn-1">btn1</button>
	<button data-testid="btn-2">btn2</button>
</div>
{#if open}
	<FloatingFocusManager
		context={floating.context}
		{outsideElementsInert}
		{modal}>
		<div bind:this={floating.floating} data-testid="floating"></div>
	</FloatingFocusManager>
{/if}
