<script lang="ts">
	import FloatingPortal from "../../../../../src/components/floating-portal/floating-portal.svelte";
	import {
		useDismiss,
		useFloating,
		useInteractions,
	} from "../../../../../src/index.js";

	let open = $state(true);

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => (open = v),
	});

	const ints = useInteractions([useDismiss(f.context)]);
</script>

<button bind:this={f.elements.reference} {...ints.getReferenceProps()}
	>open</button>
{#if open}
	<div bind:this={f.elements.floating} {...ints.getFloatingProps()}>
		<FloatingPortal>
			<button data-testid="portaled-button">portaled-button</button>
		</FloatingPortal>
	</div>
{/if}
