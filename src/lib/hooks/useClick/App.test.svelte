<script lang="ts">
	import { autoUpdate } from '@floating-ui/dom';
	import { useClick, type UseClickOptions } from './index.svelte.js';
	import { useFloating } from '../useFloating/index.svelte.js';
	import { useInteractions } from '../useInteractions/index.svelte.js';
	import { useHover } from '../useHover/index.svelte.js';
	interface Props extends UseClickOptions {
		open?: boolean;
		element?: string;
		enableHover?: boolean;
	}
	let {
		open = false,
		element = 'button',
		enableHover = false,
		...useClickOptions
	}: Props = $props();
	const elements: { reference: HTMLElement | null; floating: HTMLElement | null } = $state({
		reference: null,
		floating: null,
	});
	const floating = useFloating({
		whileElementsMounted: autoUpdate,
		get open() {
			return open;
		},
		onOpenChange(v) {
			open = v;
		},
		elements,
	});
	const click = useClick(floating.context, useClickOptions);
	const hover = useHover(floating.context, { enabled: enableHover });
	const interactions = useInteractions([click, hover]);
</script>

<svelte:element
	this={element}
	role="button"
	data-testid="reference"
	bind:this={elements.reference}
	{...interactions.getReferenceProps()}
>
	Reference
</svelte:element>

{#if open}
	<div
		role="tooltip"
		bind:this={elements.floating}
		style={floating.floatingStyles}
		{...interactions.getFloatingProps()}
	>
		Floating
	</div>
{/if}
