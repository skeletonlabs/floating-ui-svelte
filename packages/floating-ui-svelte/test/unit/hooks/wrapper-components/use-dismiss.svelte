<script lang="ts">
	import { autoUpdate } from "@floating-ui/dom";
	import {
		type UseDismissOptions,
		useDismiss,
	} from "../../../../src/hooks/use-dismiss.svelte";
	import { useFloating } from "../../../../src/hooks/use-floating.svelte";
	import { useInteractions } from "../../../../src/hooks/use-interactions.svelte";

	interface Props extends UseDismissOptions {
		open?: boolean;
	}

	let { open = false, ...useDismissOptions }: Props = $props();

	const floating = useFloating({
		whileElementsMounted: autoUpdate,
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
	});

	const dismiss = useDismiss(floating.context, useDismissOptions);
	const interactions = useInteractions([dismiss]);
</script>

<button
	data-testid="reference"
	bind:this={floating.elements.reference}
	{...interactions.getReferenceProps()}>
	button
</button>

{#if open}
	<div
		data-testid="floating"
		bind:this={floating.elements.floating}
		style={floating.floatingStyles}
		{...interactions.getFloatingProps()}>
	</div>
{/if}
