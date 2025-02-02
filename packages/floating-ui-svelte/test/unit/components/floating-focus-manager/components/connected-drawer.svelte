<script lang="ts">
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import {
		useDismiss,
		useFloating,
		useInteractions,
	} from "../../../../../src/index.js";

	let {
		open,
		onOpenChange,
	}: { open: boolean; onOpenChange: (v: boolean) => void } = $props();

	const f = useFloating({
		open,
		onOpenChange,
	});

	const ints = useInteractions([useDismiss(f.context)]);
</script>

<FloatingFocusManager context={f.context}>
	<div bind:this={f.elements.floating} {...ints.getFloatingProps()}>
		<button data-testid="child-reference"> child reference </button>
	</div>
</FloatingFocusManager>
