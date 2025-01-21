<script lang="ts">
	import {
		useClientPoint,
		useFloating,
		useInteractions,
	} from "../../../../src/index.js";

	let {
		enabled = true,
		x = null,
		y = null,
		axis,
	}: {
		enabled?: boolean;
		x?: number | null;
		y?: number | null;
		axis?: "both" | "x" | "y";
	} = $props();

	let open = $state(false);

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
	});

	const clientPoint = useClientPoint(f.context, {
		enabled: () => enabled,
		x: () => x,
		y: () => y,
		axis,
	});

	const ints = useInteractions([clientPoint]);

	const rect = $derived(f.reference?.getBoundingClientRect());
</script>

<button onclick={() => (open = !open)} data-testid="toggle-open"
	>toggle open</button>
<button onclick={() => (enabled = !enabled)} data-testid="toggle-enabled"
	>toggle enabled</button>
<div
	data-testid="reference"
	bind:this={f.reference}
	{...ints.getReferenceProps()}>
	Reference
</div>
{#if open}
	<div
		data-testid="floating"
		bind:this={f.floating}
		{...ints.getFloatingProps()}>
		Floating
	</div>
{/if}
<span data-testid="x">{rect?.x}</span>
<span data-testid="y">{rect?.y}</span>
<span data-testid="width">{rect?.width}</span>
<span data-testid="height">{rect?.height}</span>
<button
	data-testid="set-point"
	onclick={() => {
		x = 1000;
		y = 1000;
	}}>set point</button>
