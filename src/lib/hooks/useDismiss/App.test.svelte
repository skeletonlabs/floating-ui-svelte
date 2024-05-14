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

	const elements: { reference: HTMLElement | null; floating: HTMLElement | null } = $state({
		reference: null,
		floating: null,
	});
	const floating = useFloating({
		whileElementsMounted: autoUpdate,
		get open() {
			return open;
		},
		onOpenChange(v) {
			open = v;
		},
		elements,
	});

	const dismiss = useDismiss(floating.context, useDismissOptions);

	const interactions = useInteractions([dismiss]);
</script>

<div data-testid="reference" bind:this={elements.reference} {...interactions.getReferenceProps()}>
	Reference
</div>

{#if open}
	<div
		data-testid="floating"
		bind:this={elements.floating}
		style={floating.floatingStyles}
		{...interactions.getFloatingProps()}
	>
		Floating
	</div>
{/if}
