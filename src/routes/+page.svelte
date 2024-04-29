<script lang="ts">
	import { useHover } from '$lib/hooks/useHover/index.svelte.js';
	import { useFloating, autoUpdate } from '$lib/index.js';

	let open = $state(false);
	const elements = $state<{ reference?: HTMLElement; floating?: HTMLElement }>({});
	const floating = useFloating({
		elements,
		whileElementsMounted: autoUpdate,
		get open() {
			return open;
		},
		onOpenChange(v) {
			open = v;
		}
	});

	const hover = useHover(floating, {
		delay: {
			show: 250,
			hide: 0
		}
	});
</script>

<button bind:this={elements.reference} {...hover.referenceProps}>Reference</button>

{#if open}
	<div bind:this={elements.floating} style={floating.floatingStyles}>Floating</div>
{/if}
