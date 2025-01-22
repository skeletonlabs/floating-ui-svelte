<script lang="ts">
	import type { UseTypeaheadOptions } from "../../../../../src/index.js";
	import { useImpl } from "./impl.svelte.js";

	let props: Pick<UseTypeaheadOptions, "onMatch"> & { list: Array<string> } =
		$props();
	const impl = useImpl(props);
	let input = $state<HTMLInputElement>(null!);
</script>

<div
	bind:this={impl.floating.reference}
	{...impl.getReferenceProps({
		onclick: () => input.focus(),
	})}>
	<input bind:this={input} readOnly={true} />
</div>
{#if impl.open}
	<div bind:this={impl.floating.floating} {...impl.getFloatingProps()}>
		{#each props.list as value, i (value)}
			<div
				role="option"
				tabindex={i === impl.activeIndex ? 0 : -1}
				aria-selected={i === impl.activeIndex}>
				{value}
			</div>
		{/each}
	</div>
{/if}
