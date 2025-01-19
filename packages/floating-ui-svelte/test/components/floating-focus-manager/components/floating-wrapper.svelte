<script lang="ts">
	import FloatingFocusManager from "../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import {
		useFloating,
		useInteractions,
		useRole,
	} from "../../../../src/index.js";

	let open = $state(false);

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
	});

	const ints = useInteractions([useRole(f.context)]);
</script>

<button
	bind:this={f.reference}
	{...ints.getReferenceProps({
		onclick: () => (open = !open),
	})}>
	ref
</button>

{#if open}
	<FloatingFocusManager context={f.context}>
		<div bind:this={f.floating} data-testid="outer">
			<div {...ints.getFloatingProps()} data-testid="inner"></div>
		</div>
	</FloatingFocusManager>
{/if}
