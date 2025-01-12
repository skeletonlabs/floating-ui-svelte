<script lang="ts">
	import {
		useClick,
		useFloating,
		useInteractions,
	} from "@skeletonlabs/floating-ui-svelte";

	const floating = useFloating();
	const click = useClick(floating.context);
	const interactions = useInteractions([click]);
</script>

<!-- Reference Element -->
<button bind:this={floating.reference} {...interactions.getReferenceProps()}>
	Reference
</button>

<!-- Floating Element -->
<div
	bind:this={floating.floating}
	style={floating.floatingStyles}
	{...interactions.getFloatingProps()}>
	Floating
</div>
