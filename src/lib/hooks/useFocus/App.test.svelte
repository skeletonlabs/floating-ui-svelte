<!-- Component used to test `useHover` -->
<script lang="ts">
	import { autoUpdate } from '@floating-ui/dom';
	import { useFloating } from '../useFloating/index.svelte.js';
	import { useInteractions } from '../useInteractions/index.svelte.js';
	import { useFocus, type UseFocusOptions } from './index.svelte.js';

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
	{...interactions.getReferenceProps()}
>
	Reference
</button>

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
