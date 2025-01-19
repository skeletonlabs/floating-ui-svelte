<script lang="ts">
	import type { ComponentProps } from "svelte";
	import Tooltip from "./tooltip.svelte";
	import FloatingDelayGroup from "../../../../../src/components/floating-delay-group.svelte";

	let {
		delay = { open: 1000, close: 100 },
		...rest
	}: Omit<
		Partial<ComponentProps<typeof FloatingDelayGroup>>,
		"children"
	> = $props();
</script>

<FloatingDelayGroup {...rest} {delay}>
	<Tooltip label="one">
		{#snippet reference(ref, props)}
			<button
				data-testid="reference-one"
				bind:this={ref.current}
				{...props}>
				one
			</button>
		{/snippet}
	</Tooltip>
	<Tooltip label="two">
		{#snippet reference(ref, props)}
			<button
				data-testid="reference-two"
				bind:this={ref.current}
				{...props}>
				two
			</button>
		{/snippet}
	</Tooltip>
	<Tooltip label="three">
		{#snippet reference(ref, props)}
			<button
				data-testid="reference-three"
				bind:this={ref.current}
				{...props}>
				three
			</button>
		{/snippet}
	</Tooltip>
</FloatingDelayGroup>
