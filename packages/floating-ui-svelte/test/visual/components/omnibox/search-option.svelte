<script lang="ts">
	import { useListItem } from "../../../../src/components/floating-list/hooks.svelte.js";
	import { useId } from "../../../../src/index.js";
	import { SelectContext } from "./context.js";
	import X from "lucide-svelte/icons/x";
	import c from "clsx";

	let {
		value,
		onclick,
		onRemove,
	}: {
		value: string;
		onclick: () => void;
		onRemove: () => void;
	} = $props();

	const listItem = useListItem();
	const ctx = SelectContext.get();
	const isActive = $derived(listItem.index === ctx.activeIndex);
	const id = useId();
</script>

<div
	{id}
	bind:this={listItem.ref}
	tabindex={0}
	role="option"
	aria-selected={isActive}
	class={c(
		"p-4 outline-none cursor-default flex justify-between align-items-center",
		{
			"bg-slate-50": isActive,
		}
	)}
	{...ctx.getItemProps({
		onclick,
		onkeydown(event: KeyboardEvent & { currentTarget: HTMLElement }) {
			if (event.currentTarget !== event.target) return;

			if (event.key === "Backspace") {
				onRemove();
			} else if (event.key === " " || event.key === "Enter") {
				onclick();
			}
		},
	})}>
	{value}
	<button
		class="flex justify-center items-center text-blue-600 w-8 h-8 text-xl hover:bg-sky-100 transition-colors rounded-full"
		onclick={(e) => {
			e.stopPropagation();
			onRemove();
		}}
		aria-label="Remove">
		<X />
	</button>
</div>
