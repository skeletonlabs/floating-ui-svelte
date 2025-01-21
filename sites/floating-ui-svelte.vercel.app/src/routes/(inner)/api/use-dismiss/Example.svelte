<script lang="ts">
	import {
		useDismiss,
		useFloating,
		useInteractions,
	} from "@skeletonlabs/floating-ui-svelte";

	const floating = useFloating();
	const dismiss = useDismiss(floating.context);
	const interactions = useInteractions([dismiss]);
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
