<script lang="ts">
	import { useFloating } from '@skeletonlabs/floating-ui-svelte';

	const floating = useFloating();
</script>

<!-- Reference -->
<div bind:this={floating.elements.reference}>Reference</div>

<!-- Floating element is always rendered -->
<div class="floating" bind:this={floating.elements.floating} style={floating.floatingStyles}>
	<!-- The content of the floating element is shown once `isPositioned` is true -->
	{#if floating.isPositioned}
		Floating
	{/if}
</div>

<style>
	.floating {
		width: max-content;
		position: absolute;
		top: 0;
		left: 0;
	}
</style>
