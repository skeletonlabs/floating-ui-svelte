<script lang="ts">
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { useId, type WithRef } from "../../../../src/index.js";
	import c from "clsx";

	let {
		id = useId(),
		name,
		children,
		active,
		selected,
		ref = $bindable(),
		index,
		...rest
	}: HTMLButtonAttributes & {
		name: string;
		active: boolean;
		selected: boolean;
		index: number;
	} & Partial<WithRef<HTMLElement>> = $props();
</script>

<button
	{...rest}
	bind:this={ref}
	{id}
	role="option"
	class={c(
		"rounded text-3xl text-center cursor-default select-none aspect-square",
		{
			"bg-cyan-100": selected && !active,
			"bg-cyan-200": active,
			"opacity-40": name === "orange",
		}
	)}
	aria-selected={selected}
	disabled={name === "orange"}
	aria-label={name}
	tabindex={-1}
	data-index={index}
	data-active={active ? "" : undefined}>
	{@render children?.()}
</button>
