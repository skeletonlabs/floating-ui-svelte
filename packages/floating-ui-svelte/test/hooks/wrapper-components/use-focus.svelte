<script lang="ts">
	import { autoUpdate } from "@floating-ui/dom";
	import { useFloating } from "../../../src/hooks/use-floating.svelte";
	import {
		type UseFocusOptions,
		useFocus,
	} from "../../../src/hooks/use-focus.svelte";
	import { useInteractions } from "../../../src/hooks/use-interactions.svelte";

	interface Props extends UseFocusOptions {
		open?: boolean;
	}

	let { open = false, ...useFocusOptions }: Props = $props();

	const floating = useFloating({
		whileElementsMounted: autoUpdate,
		get open() {
			return open;
		},
		onOpenChange(v) {
			open = v;
		},
	});

	const focus = useFocus(floating.context, useFocusOptions);
	const interactions = useInteractions([focus]);
</script>

<button
	data-testid="reference"
	bind:this={floating.elements.reference}
	{...interactions.getReferenceProps()}>button</button>

{#if open}
	<div
		data-testid="floating"
		bind:this={floating.elements.floating}
		style={floating.floatingStyles}
		{...interactions.getFloatingProps()}>
	</div>
{/if}
