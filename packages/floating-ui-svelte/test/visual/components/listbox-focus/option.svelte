<script lang="ts">
	import { useListItem } from "../../../../src/components/floating-list/hooks.svelte.js";
	import { styleObjectToString } from "../../../../src/internal/style-object-to-string.js";
	import { SelectContext } from "./context.js";

	let { label }: { label: string } = $props();

	const ctx = SelectContext.get();

	const listItem = useListItem({
		label: () => label,
	});

	const isActive = $derived(ctx.activeIndex === listItem.index);
	const isSelected = $derived(ctx.selectedIndex === listItem.index);

	const isFocusable = $derived(
		ctx.activeIndex !== null
			? isActive
			: ctx.selectedIndex !== null
				? isSelected
				: listItem.index === 0
	);
</script>

<button
	bind:this={listItem.ref}
	role="option"
	aria-selected={isActive && isSelected}
	tabindex={isFocusable ? 0 : -1}
	style={styleObjectToString({
		background: isActive ? "cyan" : "",
		"font-weight": isSelected ? "bold" : "",
	})}
	{...ctx.getItemProps({
		onclick: () => ctx.handleSelect(listItem.index),
	})}>
	{label}
</button>
