<script lang="ts">
	import FloatingPortal from "../../../../../src/components/floating-portal/floating-portal.svelte";
	import { useFloating } from "../../../../../src/index.js";
	import type { Boxed } from "../../../../../src/types.js";

	let props: { root?: HTMLElement | null; id?: string } = $props();

	let open = $state(false);
	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
	});
</script>

<button
	data-testid="reference"
	bind:this={f.reference}
	onclick={() => (open = !open)}>open</button>
<FloatingPortal {...props}>
	{#if open}
		<div bind:this={f.floating} data-testid="floating"></div>
	{/if}
</FloatingPortal>
