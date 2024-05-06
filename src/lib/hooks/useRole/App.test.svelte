<script lang="ts">
	import { autoUpdate } from '@floating-ui/dom';
	import { useFloating } from '../useFloating/index.svelte.js';
	import { useInteractions } from '../useInteractions/index.svelte.js';
	import { useRole, type UseRoleOptions } from '../useRole/index.svelte.js';
	interface Props extends UseRoleOptions {
		open?: boolean;
	}
	let { open = true, ...rest }: Props = $props();
	const elements: { reference: HTMLElement | null; floating: HTMLElement | null } = $state({
		reference: null,
		floating: null
	});
	const floating = useFloating({
		whileElementsMounted: autoUpdate,
		get open() {
			return open;
		},
		onOpenChange(v) {
			open = v;
		},
		elements
	});
	const role = useRole(floating.context, { ...rest });
	const interactions = useInteractions([role]);
</script>

<p>{open}</p>
<button bind:this={elements.reference} {...interactions.getReferenceProps()}> Reference </button>
{#if open}
	<div
		bind:this={elements.floating}
		style={floating.floatingStyles}
		{...interactions.getFloatingProps()}
	>
		Floating
	</div>
{/if}
