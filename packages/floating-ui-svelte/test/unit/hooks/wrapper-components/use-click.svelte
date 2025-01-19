<script lang="ts">
	import { autoUpdate } from "@floating-ui/dom";
	import { useFloating } from "../../../../src/hooks/use-floating.svelte.js";
	import { useHover } from "../../../../src/hooks/use-hover.svelte.js";
	import { useInteractions } from "../../../../src/hooks/use-interactions.svelte.js";
	import { useClick, type UseClickOptions } from "../../../../src/index.js";

	interface Props extends UseClickOptions {
		open?: boolean;
		element?: string;
		enableHover?: boolean;
	}

	let {
		open = false,
		element = "button",
		enableHover = false,
		...useClickOptions
	}: Props = $props();

	const floating = useFloating({
		whileElementsMounted: autoUpdate,
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
	});

	const click = useClick(floating.context, useClickOptions);
	const hover = useHover(floating.context, { enabled: enableHover });
	const interactions = useInteractions([click, hover]);
</script>

<svelte:element
	this={element}
	bind:this={floating.reference}
	data-testid="reference"
	{...interactions.getReferenceProps()}></svelte:element>
{#if open}
	<div
		data-testid="floating"
		bind:this={floating.floating}
		style={floating.floatingStyles}
		{...interactions.getFloatingProps()}>
	</div>
{/if}
