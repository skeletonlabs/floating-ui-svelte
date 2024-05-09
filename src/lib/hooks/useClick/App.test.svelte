<script lang="ts">
	import { autoUpdate } from '@floating-ui/dom';
	import { useClick, type UseClickOptions } from './index.svelte.js';
	import { useFloating } from '../useFloating/index.svelte.js';
	import { useInteractions } from '../useInteractions/index.svelte.js';

	const { ...rest }: UseClickOptions = $props();

	let open = $state(false);
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

	const click = useClick(floating.context, { ...rest });

	const interactions = useInteractions([click]);
</script>

<div
	role="button"
	data-testid="reference"
	bind:this={elements.reference}
	{...interactions.getReferenceProps()}
>
	Reference
</div>

{#if open}
	<div
		role="tooltip"
		bind:this={elements.floating}
		style={floating.floatingStyles}
		{...interactions.getFloatingProps()}
	>
		Floating
	</div>
{/if}
