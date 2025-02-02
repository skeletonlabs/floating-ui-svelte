<script lang="ts">
	import FloatingFocusManager from "../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import {
		useClick,
		useDismiss,
		useFloating,
		useInteractions,
		useListNavigation,
	} from "../../../../src/index.js";
	import { mergeStyles } from "../../../../src/internal/style-object-to-string.js";

	let {
		orientation = "horizontal",
		loop = false,
	}: { orientation?: "horizontal" | "both"; loop?: boolean } = $props();

	let open = $state(false);
	let activeIndex = $state<number | null>(null);

	let listRef = $state<Array<HTMLElement | null>>([]);

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => (open = v),
		placement: "bottom-start",
	});

	const disabledIndices = [0, 1, 2, 3, 4, 5, 6, 7, 10, 15, 45, 48];

	const ints = useInteractions([
		useClick(f.context),
		useListNavigation(f.context, {
			listRef: () => listRef,
			activeIndex: () => activeIndex,
			onNavigate: (v) => (activeIndex = v),
			cols: 5,
			orientation: () => orientation,
			loop: () => loop,
			openOnArrowKeyDown: false,
			disabledIndices,
		}),
		useDismiss(f.context),
	]);
</script>

<h1>Grid</h1>
<div class="container">
	<button bind:this={f.elements.reference} {...ints.getReferenceProps()}>
		Reference
	</button>
	{#if open}
		<FloatingFocusManager context={f.context}>
			<div
				role="menu"
				bind:this={f.elements.floating}
				data-testid="floating"
				class="grid gap-2"
				style={mergeStyles(f.floatingStyles, {
					"grid-template-columns": "100px 100px 100px 100px 100px",
					"z-index": 999,
				})}
				{...ints.getFloatingProps()}>
				{#each { length: 49 } as _, index (index)}
					<button
						role="option"
						aria-selected={activeIndex === index}
						tabindex={activeIndex === index ? 0 : -1}
						disabled={disabledIndices.includes(index)}
						bind:this={listRef[index]}
						class="border border-black disabled:opacity-20"
						{...ints.getItemProps()}>
						Item {index}
					</button>
				{/each}
			</div>
		</FloatingFocusManager>
	{/if}
</div>
