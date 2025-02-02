<script lang="ts">
	import type { UseTypeaheadOptions } from "../../../../../src/index.js";
	import { useImpl } from "./impl.svelte.js";

	let props: Pick<UseTypeaheadOptions, "onMatch" | "onTypingChange"> & {
		list?: Array<string>;
	} = $props();

	let open = $state(false);
	const impl = useImpl({
		...props,
		open: () => open,
		onOpenChange: (v) => (open = v),
		addUseClick: true,
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	tabindex={0}
	bind:this={impl.floating.elements.reference}
	{...impl.getReferenceProps()}>
</div>
{#if open}
	<div
		bind:this={impl.floating.elements.floating}
		{...impl.getFloatingProps()}>
	</div>
{/if}
