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
<button bind:this={floating.elements.reference} {...interactions.getReferenceProps()}>
	Reference
</button>

<!-- Floating Element -->
<div
	bind:this={floating.elements.floating}
	style={floating.floatingStyles}
	{...interactions.getFloatingProps()}
>
	Floating
</div>
