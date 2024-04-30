<script lang="ts">
	import { offset, flip, useFloating, useHover, autoUpdate } from '$lib/index.js';
	import { fly } from 'svelte/transition';

	let open = $state(false);

	const elements = $state<{ reference: HTMLElement | null; floating: HTMLElement | null }>({
		reference: null,
		floating: null
	});

	const floating = useFloating({
		whileElementsMounted: autoUpdate,
		middleware: [offset(5)],
		placement: 'top',
		transform: false,
		get open() {
			return open;
		},
		onOpenChange(v) {
			open = v;
		},
		elements
	});

	const hover = useHover(floating, {
		restMs: 300
	});
</script>

<button class="btn-cta" bind:this={elements.reference} {...hover.referenceProps}>Hover Me</button>

{#if open}
	<div
		class="absolute top-0 left-0 btn-rose-sm"
		bind:this={elements.floating}
		style={floating.floatingStyles}
		transition:fly={{ y: 5, duration: 250 }}
	>
		Tooltip!
	</div>
{/if}
