<script lang="ts">
	import { untrack, type Snippet } from "svelte";
	import { SelectContext, type SelectContextData } from "./context.js";
	import { useListItem } from "../../../../src/components/floating-list/hooks.svelte.js";
	import c from "clsx";
	import ColorSwatch from "./color-swatch.svelte";
	import Check from "lucide-svelte/icons/check";

	let { children, value }: { children: Snippet; value: string } = $props();

	const ctx = SelectContext.get();

	const listItem = useListItem({ label: () => value });
	const isActive = $derived(listItem.index === ctx.activeIndex);
	const isSelected = $derived(listItem.index === ctx.selectedIndex);

	$effect.pre(() => {
		if (
			listItem.index !== ctx.selectedIndex &&
			value === ctx.selectedValue
		) {
			untrack(() => (ctx.selectedIndex = listItem.index));
		}
	});

	function onSelect() {
		ctx.setSelectedValue(value, listItem.index);
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	bind:this={listItem.ref}
	class={c(
		"flex gap-2 items-center p-2 rounded outline-none cursor-default scroll-my-1",
		{
			"bg-cyan-200": isActive,
		}
	)}
	tabindex={isActive ? 0 : -1}
	{...ctx.getItemProps({
		active: isActive,
		selected: isSelected,
		// Handle pointer select.
		onclick: () => {
			onSelect();
		},
		// Handle keyboard select.
		onkeydown: (event: KeyboardEvent) => {
			if (event.key === "Enter") {
				event.preventDefault();
				onSelect();
			}

			// Only if not using typeahead.
			if (event.key === " " && !ctx.isTyping) {
				event.preventDefault();
				onSelect();
			}
		},
	})}>
	<ColorSwatch color={value?.toLowerCase()} />
	{@render children?.()}
	<span aria-hidden="true" class="absolute right-4">
		{#if isSelected}
			<Check width={20} height={20} />
		{/if}
	</span>
</div>
