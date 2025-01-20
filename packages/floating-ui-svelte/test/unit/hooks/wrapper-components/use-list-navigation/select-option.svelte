<script lang="ts">
	import { useListItem } from "../../../../../src/components/floating-list/hooks.svelte.js";

	let {
		option,
		activeIndex,
		selectedIndex,
	}: {
		option: string;
		activeIndex: number | null;
		selectedIndex: number | null;
	} = $props();

	const listItem = useListItem();
</script>

<button
	id="option-{option}"
	bind:this={listItem.ref}
	role="option"
	tabindex={listItem.index === activeIndex ? 0 : -1}
	aria-selected={listItem.index === selectedIndex}>
	<span>
		{option} listItemIndex {listItem.index} activeIndex {activeIndex}
	</span>
</button>
