<script lang="ts">
	import { useFloating } from '@skeletonlabs/floating-ui-svelte';

	const floating = useFloating();
</script>

<!-- Floating element is always rendered -->
<div class="floating" bind:this={floating.elements.floating} style={floating.floatingStyles}>
	<!-- The content of the floating element is shown once `isPositioned` is true -->
	{#if floating.isPositioned}
		Floating
	{/if}
</div>
