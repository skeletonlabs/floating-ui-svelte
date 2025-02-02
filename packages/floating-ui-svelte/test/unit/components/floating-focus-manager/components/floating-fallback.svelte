<script lang="ts">
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import { useFloating } from "../../../../../src/index.js";

	const f = useFloating({ open: true });
</script>

<button data-testid="reference" bind:this={f.elements.reference}
	>reference</button>
<FloatingFocusManager context={f.context} modal={true}>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div bind:this={f.elements.floating} data-testid="floating" tabindex={-1}>
	</div>
</FloatingFocusManager>
