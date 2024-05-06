<script lang="ts">
	import { autoUpdate } from '@floating-ui/dom';
	import { useFloating } from '../useFloating/index.svelte.js';
	import { useInteractions } from '../useInteractions/index.svelte.js';
	import { useHover, type UseHoverOptions } from './index.svelte.js';

	const { ...rest }: UseHoverOptions = $props();

	let open = $state(false);
	const elements: { reference: HTMLElement | null; floating: HTMLElement | null } = $state({
		reference: null,
		floating: null
	});
	const floating = useFloating({
		whileElementsMounted: autoUpdate,
		get open() {
			return open;
		},
		onOpenChange(v) {
			open = v;
		},
		elements
	});

	const hover = useHover(floating.context, { ...rest });

	const interactions = useInteractions([hover]);
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
