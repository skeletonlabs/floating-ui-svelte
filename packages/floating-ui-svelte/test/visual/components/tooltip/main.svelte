<script lang="ts">
	import FloatingDelayGroup from "../../../../src/components/floating-delay-group.svelte";
	import Button from "../button.svelte";
	import Tooltip from "./tooltip.svelte";
</script>

<h1 class="text-5xl font-bold mb-8">Tooltip</h1>
<div
	class="grid place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	<Tooltip label="My tooltip">
		{#snippet children(ref, props)}
			<Button bind:ref={ref.current} {...props}>My button</Button>
		{/snippet}
	</Tooltip>
</div>
<div
	class="grid place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	<div class="flex gap-1">
		<FloatingDelayGroup delay={{ open: 500, close: 200 }} timeoutMs={200}>
			<Tooltip label="My tooltip">
				{#snippet children(ref, props)}
					<Button bind:ref={ref.current} {...props}>My button</Button>
				{/snippet}
			</Tooltip>
			<Tooltip label="My tooltip 2">
				{#snippet children(ref, props)}
					<Button bind:ref={ref.current} {...props}>My button</Button>
				{/snippet}
			</Tooltip>
			<Tooltip label="My tooltip 3">
				{#snippet children(ref, props)}
					<Button bind:ref={ref.current} {...props}>My button</Button>
				{/snippet}
			</Tooltip>
		</FloatingDelayGroup>
	</div>
</div>
