<script lang="ts">
	import {
		useDismiss,
		useFloating,
		useFocus,
		useInteractions,
	} from "../../../../../src/index.js";

	let popoverOpen = $state(true);
	let tooltipOpen = $state(false);

	const popover = useFloating({
		open: () => popoverOpen,
		onOpenChange: (v) => (popoverOpen = v),
	});

	const tooltip = useFloating({
		open: () => tooltipOpen,
		onOpenChange: (v) => (tooltipOpen = v),
	});

	const popoverInts = useInteractions([useDismiss(popover.context)]);

	const tooltipInts = useInteractions([
		useFocus(tooltip.context, { visibleOnly: false }),
		useDismiss(tooltip.context),
	]);
</script>

<button
	bind:this={popover.elements.reference}
	{...popoverInts.getReferenceProps()}>open popover</button>
{#if popoverOpen}
	<div
		role="dialog"
		bind:this={popover.elements.floating}
		{...popoverInts.getFloatingProps()}>
		<button
			data-testid="focus-button"
			bind:this={tooltip.elements.reference}
			{...tooltipInts.getReferenceProps()}>open tooltip</button>
	</div>
{/if}
{#if tooltipOpen}
	<div
		role="tooltip"
		bind:this={tooltip.elements.floating}
		{...tooltipInts.getFloatingProps()}>
	</div>
{/if}
