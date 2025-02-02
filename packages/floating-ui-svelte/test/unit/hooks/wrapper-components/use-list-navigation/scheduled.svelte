<script lang="ts">
	import {
		useFloating,
		useInteractions,
		useListNavigation,
	} from "../../../../../src/index.js";
	import ScheduledOption from "./scheduled-option.svelte";

	let open = $state(false);
	let activeIndex = $state<number | null>(null);
	let listRef = $state<Array<HTMLElement | null>>([]);

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => (open = v),
	});

	const listNav = useListNavigation(f.context, {
		listRef: () => listRef,
		activeIndex: () => activeIndex,
		onNavigate: (v) => (activeIndex = v),
	});

	const ints = useInteractions([listNav]);
</script>

<button
	bind:this={f.elements.reference}
	{...ints.getReferenceProps({
		onclick: () => (open = !open),
	})}>
	Open
</button>
{#if open}
	<div bind:this={f.elements.floating} {...ints.getFloatingProps()}>
		{#each ["one", "two", "three"] as option, index (option)}
			<ScheduledOption
				bind:listRef
				getItemProps={ints.getItemProps}
				{index}
				active={activeIndex === index} />
		{/each}
	</div>
{/if}
