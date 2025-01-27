<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithRef } from "../../../../src/types.js";
	import c from "clsx";

	let {
		ref = $bindable(),
		active,
		children,
		...rest
	}: WithRef &
		HTMLAttributes<HTMLDivElement> & { active: boolean } = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	bind:this={ref}
	tabindex={-1}
	class={c("p-2 cursor-default", {
		"bg-blue-500 text-white": active,
	})}
	{...rest}>
	{@render children?.()}
</div>
