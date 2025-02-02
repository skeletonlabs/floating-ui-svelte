<script lang="ts">
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import {
		useClick,
		useFloating,
		useInteractions,
	} from "../../../../../src/index.js";

	let { disabled: disabledProp = true }: { disabled?: boolean } = $props();

	let disabled = $state(disabledProp);
	let open = $state(false);

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
	});

	const ints = useInteractions([useClick(f.context)]);
</script>

<button
	data-testid="reference"
	bind:this={f.elements.reference}
	{...ints.getReferenceProps()}>
	ref
</button>
<button data-testid="toggle" onclick={() => (disabled = !disabled)}>
	toggle disabled
</button>

{#if open}
	<FloatingFocusManager context={f.context} {disabled}>
		<div
			bind:this={f.elements.floating}
			data-testid="floating"
			{...ints.getFloatingProps()}>
		</div>
	</FloatingFocusManager>
{/if}
