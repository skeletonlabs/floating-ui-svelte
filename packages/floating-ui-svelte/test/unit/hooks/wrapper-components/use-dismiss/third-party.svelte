<script lang="ts">
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
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

	const dismiss = useDismiss(f.context);

	const ints = useInteractions([dismiss]);
</script>

<button bind:this={f.elements.reference} {...ints.getReferenceProps()}
	>open</button>
{#if open}
	<FloatingFocusManager context={f.context}>
		<div
			role="dialog"
			bind:this={f.elements.floating}
			{...ints.getFloatingProps()}>
		</div>
	</FloatingFocusManager>
{/if}
