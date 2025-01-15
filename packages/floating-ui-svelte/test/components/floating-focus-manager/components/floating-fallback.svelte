<script lang="ts">
	import FloatingFocusManager from "../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import { useFloating } from "../../../../src/index.js";

	const floating = useFloating({ open: true });
</script>

<button data-testid="reference" bind:this={floating.reference}
	>reference</button>
<FloatingFocusManager context={floating.context} modal={true}>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div bind:this={floating.floating} data-testid="floating" tabindex={-1}>
	</div>
</FloatingFocusManager>
