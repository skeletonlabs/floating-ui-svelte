<script lang="ts">
	import { useFloating, useInteractions, useDismiss } from '@skeletonlabs/floating-ui-svelte';

	const floating = useFloating();
	const click = useDismiss(floating.context);
	const interactions = useInteractions([click]);
</script>

<!-- Reference Element -->
<button bind:this={floating.elements.reference} {...interactions.getReferenceProps()}>
	Reference
</button>

<!-- Floating Element -->
<div
	bind:this={floating.elements.floating}
	style={floating.floatingStyles}
	{...interactions.getFloatingProps()}
>
	Tooltip
</div>
