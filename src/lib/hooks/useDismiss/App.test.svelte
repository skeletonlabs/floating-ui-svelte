<!-- Component used to test `useHover` -->
<script lang="ts">
	import { autoUpdate } from '@floating-ui/dom';
	import { useFloating } from '../useFloating/index.svelte.js';
	import { useInteractions } from '../useInteractions/index.svelte.js';
	import { useDismiss, type UseDismissOptions } from './index.svelte.js';

	interface Props extends UseDismissOptions {
		open?: boolean;
	}

	let { open = false, ...useDismissOptions }: Props = $props();

	const floating = useFloating({
		whileElementsMounted: autoUpdate,
		get open() {
			return open;
		},
		onOpenChange(v) {
			open = v;
		},
	});

	const dismiss = useDismiss(floating.context, useDismissOptions);
	const interactions = useInteractions([dismiss]);
</script>

<button
	data-testid="reference"
	bind:this={floating.elements.reference}
	{...interactions.getReferenceProps()}
></button>

{#if open}
	<div
		data-testid="floating"
		bind:this={floating.elements.floating}
		style={floating.floatingStyles}
		{...interactions.getFloatingProps()}
	></div>
{/if}
