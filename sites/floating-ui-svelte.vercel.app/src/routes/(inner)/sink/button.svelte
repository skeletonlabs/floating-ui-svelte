<script lang="ts">
	import type { HTMLButtonAttributes } from "svelte/elements";
	import cn from "clsx";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: HTMLButtonAttributes & {
		ref?: Element | null;
	} = $props();
</script>

<button
	{...rest}
	bind:this={ref}
	class={cn(
		className,
		"bg-slate-200/90 rounded p-2 px-3 transition-colors hover:bg-slate-200/50 data-[open]:bg-slate-200/50"
	)}>
	{@render children?.()}
</button>
