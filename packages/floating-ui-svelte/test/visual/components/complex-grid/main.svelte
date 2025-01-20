<script lang="ts">
	import FloatingFocusManager from "../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import {
		useClick,
		useFloating,
		useInteractions,
		useListNavigation,
	} from "../../../../src/index.js";
	import {
		styleObjectToString,
		styleStringToObject,
	} from "../../../../src/internal/style-object-to-string.js";

	/*
	 * Grid diagram for reference:
	 * Disabled indices marked with ()
	 *
	 * (0)  (1)  (1)  (2)  (3)  (4)  (5)
	 * (6)   7    8   (9)  10   11   12
	 * 13  (14)  15   16   17   18   19
	 * 20   20   21   21   21   21   21
	 * 20   20   22  (23) (23) (23)  24
	 * 25   26   27   28   29   29   30
	 * 31   32   33   34   29   29  (35)
	 * 36   36
	 */
	let {
		orientation = "horizontal",
		loop = false,
		rtl = false,
	}: {
		orientation?: "horizontal" | "both";
		loop?: boolean;
		rtl?: boolean;
	} = $props();

	let open = $state(false);
	let activeIndex = $state<number | null>(null);
	let listRef = $state<Array<HTMLElement | null>>([]);

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => (open = v),
		placement: "bottom-start",
	});

	const disabledIndices = [0, 1, 2, 3, 4, 5, 6, 9, 14, 23, 35];

	const itemSizes = Array.from(Array(37), () => ({ width: 1, height: 1 }));
	itemSizes[1].width = 2;
	itemSizes[20].width = 2;
	itemSizes[20].height = 2;
	itemSizes[21].width = 5;
	itemSizes[23].width = 3;
	itemSizes[29].width = 2;
	itemSizes[29].height = 2;
	itemSizes[36].width = 2;

	const ints = useInteractions([
		useClick(f.context),
		useListNavigation(f.context, {
			listRef: () => listRef,
			activeIndex: () => activeIndex,
			onNavigate: (v) => (activeIndex = v),
			cols: 7,
			orientation,
			loop,
			rtl,
			openOnArrowKeyDown: false,
			disabledIndices,
			itemSizes,
		}),
	]);
</script>

<h1>Complex Grid</h1>
<div class="container">
	<button bind:this={f.reference} {...ints.getReferenceProps()}>
		Reference
	</button>
	{#if open}
		<FloatingFocusManager context={f.context}>
			<div
				bind:this={f.floating}
				data-testid="floating"
				class="grid gap-2"
				style={styleObjectToString({
					...styleStringToObject(f.floatingStyles),
					display: "grid",
					"grid-template-columns":
						"100px 100px 100px 100px 100px 100px 100px",
					"z-index": 999,
				})}
				{...ints.getFloatingProps()}>
				{#each { length: 37 } as _, index (index)}
					<button
						role="option"
						aria-selected={activeIndex === index}
						tabindex={activeIndex === index ? 0 : -1}
						disabled={disabledIndices.includes(index)}
						bind:this={listRef[index]}
						class="border border-black disabled:opacity-20"
						style={styleObjectToString({
							"grid-row": `span ${itemSizes[index].height}`,
							"grid-column": `span ${itemSizes[index].width}`,
						})}
						{...ints.getItemProps()}>
						Item {index}
					</button>
				{/each}
			</div>
		</FloatingFocusManager>
	{/if}
</div>
