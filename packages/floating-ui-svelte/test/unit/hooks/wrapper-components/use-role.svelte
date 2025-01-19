<script lang="ts">
	import { autoUpdate } from "@floating-ui/dom";
	import { useFloating } from "../../../../src/hooks/use-floating.svelte.js";
	import { useInteractions } from "../../../../src/hooks/use-interactions.svelte.js";
	import {
		type UseRoleOptions,
		useRole,
	} from "../../../../src/hooks/use-role.svelte.js";
	interface Props extends UseRoleOptions {
		open?: boolean;
	}
	let { open = false, ...useRoleOptions }: Props = $props();
	const floating = useFloating({
		whileElementsMounted: autoUpdate,
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
	});
	const role = useRole(floating.context, useRoleOptions);
	const interactions = useInteractions([role]);
</script>

<button
	data-testid="reference"
	bind:this={floating.reference}
	{...interactions.getReferenceProps()}>
	button
</button>

{#if open}
	<div
		data-testid="floating"
		bind:this={floating.floating}
		style={floating.floatingStyles}
		{...interactions.getFloatingProps()}>
		{#each [1, 2, 3] as i}
			<div
				data-testid="item-{i}"
				{...interactions.getItemProps({
					active: i === 2,
					selected: i === 2,
				})}>
			</div>
		{/each}
	</div>
{/if}
