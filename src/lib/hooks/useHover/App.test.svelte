<!-- Component used to test `useHover` -->
<script lang="ts">
	import { autoUpdate } from '@floating-ui/dom';
	import { useFloating } from '../useFloating/index.svelte.js';
	import { useInteractions } from '../useInteractions/index.svelte.js';
	import { useHover, type UseHoverOptions } from './index.svelte.js';

	interface Props extends UseHoverOptions {
		open?: boolean;
		showReference?: boolean;
	}

	let { open = false, showReference = true, ...useHoverOptions }: Props = $props();

	const floating = useFloating({
		whileElementsMounted: autoUpdate,
		get open() {
			return open;
		},
		onOpenChange(v) {
			open = v;
		},
	});

	const hover = useHover(floating.context, useHoverOptions);
	const interactions = useInteractions([hover]);
</script>

{#if showReference}
	<button
		data-testid="reference"
		bind:this={floating.elements.reference}
		{...interactions.getReferenceProps()}
	>
		Reference
	</button>
{/if}

{#if open}
	<div
		data-testid="floating"
		bind:this={floating.elements.floating}
		style={floating.floatingStyles}
		{...interactions.getFloatingProps()}
	>
		Floating
	</div>
{/if}
