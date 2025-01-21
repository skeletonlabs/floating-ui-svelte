<script lang="ts">
	import {
		useFloating,
		useFocus,
		useInteractions,
	} from "@skeletonlabs/floating-ui-svelte";

	const floating = useFloating();
	const focus = useFocus(floating.context);
	const interactions = useInteractions([focus]);
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
