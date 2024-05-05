<script lang="ts">
	import { useFloating, useHover, useInteractions, autoUpdate } from '$lib/index.js';

	let open = $state(false);
	const elements: { reference: HTMLElement | null; floating: HTMLElement | null } = $state({
		reference: null,
		floating: null
	});
	const floating = useFloating({
		get open() {
			return open;
		},
		onOpenChange(v, reason) {
			open = v;
		},
		whileElementsMounted: autoUpdate,
		elements
	});

	const hover = useHover(floating.context, { move: false });

	const { getReferenceProps, getFloatingProps } = useInteractions([hover]);
</script>

<svelte:window on:keydown={(e: KeyboardEvent) => e.key === 'Escape' && (open = false)} />
<section class="h-[300vh]">
	<div class="bg-red-600" bind:this={elements.reference} {...getReferenceProps()}>Reference</div>

	{#if open}
		<div
			bind:this={elements.floating}
			class="absolute top-0 left-0 bg-blue-600"
			style={floating.floatingStyles}
			{...getFloatingProps()}
		>
			Floating
		</div>
	{/if}
</section>
