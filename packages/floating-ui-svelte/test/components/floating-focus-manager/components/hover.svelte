<script lang="ts">
	import FloatingFocusManager from "../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import {
		useFloating,
		useHover,
		useInteractions,
	} from "../../../../src/index.js";

	let open = $state(false);

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
	});

	const ints = useInteractions([useHover(f.context)]);
</script>

<button
	bind:this={f.reference}
	{...ints.getReferenceProps()}
	data-testid="reference">btn</button>
{#if open}
	<FloatingFocusManager context={f.context}>
		<div
			bind:this={f.floating}
			{...ints.getFloatingProps()}
			data-testid="floating">
		</div>
	</FloatingFocusManager>
{/if}
<button>outside</button>
