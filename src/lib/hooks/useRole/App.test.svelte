<!-- Component used to test `useRole` -->
<script lang="ts">
	import { autoUpdate } from '@floating-ui/dom';
	import { useFloating } from '../useFloating/index.svelte.js';
	import { useInteractions } from '../useInteractions/index.svelte.js';
	import { useRole, type UseRoleOptions } from '../useRole/index.svelte.js';
	interface Props extends UseRoleOptions {
		open?: boolean;
	}
	let { open = false, ...useRoleOptions }: Props = $props();
	const floating = useFloating({
		whileElementsMounted: autoUpdate,
		get open() {
			return open;
		},
		onOpenChange: (v) => (open = v),
	});
	const role = useRole(floating.context, useRoleOptions);
	const interactions = useInteractions([role]);
</script>

<div
	data-testid="reference"
	bind:this={floating.elements.reference}
	{...interactions.getReferenceProps()}
>
	Reference
</div>

{#if open}
	<div
		data-testid="floating"
		bind:this={floating.elements.floating}
		style={floating.floatingStyles}
		{...interactions.getFloatingProps()}
	>
		{#each [1, 2, 3] as i}
			<div
				data-testid="item-{i}"
				{...interactions.getItemProps({ active: i === 2, selected: i === 2 })}
			></div>
		{/each}
	</div>
{/if}
