<script lang="ts">
	import { offset, useFloating, useHover } from '$lib/index.js';

	let open = $state(false);

	const elements = $state<{ reference: HTMLElement | null; floating: HTMLElement | null }>({
		reference: null,
		floating: null
	});

	const floating = useFloating({
		get open() {
			return open;
		},
		onOpenChange(v) {
			open = v;
		},
		placement: 'top',
		middleware: [offset(5)],
		elements
	});

	const hover = useHover(floating, {
		delay: {
			show: 300
		}
	});
</script>

<button class="btn-cta" bind:this={elements.reference} {...hover.referenceProps}>Hover Me</button>

{#if open}
	<div
		class="absolute top-0 left-0 btn-rose-sm"
		bind:this={elements.floating}
		style={floating.floatingStyles}
	>
		Tooltip!
	</div>
{/if}
