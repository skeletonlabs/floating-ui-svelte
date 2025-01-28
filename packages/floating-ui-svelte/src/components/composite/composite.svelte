<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Boxed, Dimensions, WithRef } from "../../types.js";
	import {
		ARROW_DOWN,
		ARROW_LEFT,
		ARROW_RIGHT,
		ARROW_UP,
		buildCellMap,
		findNonDisabledIndex,
		getCellIndexOfCorner,
		getCellIndices,
		getGridNavigatedIndex,
		getMaxIndex,
		getMinIndex,
		isDisabled,
		isIndexOutOfBounds,
	} from "../../internal/composite.js";
	import { CompositeContext } from "./context.js";

	interface CompositeProps {
		/**
		 * Determines the element to render.
		 * @example
		 * ```svelte
		 * <Composite>
		 * 	{#snippet render({ children, ...props })}
		 * 		<select {...props}>
		 * 			{@render children?.()}
		 * 		</select>
		 * 	{/snippet}
		 * </Composite>
		 * ```
		 */
		render?: Snippet<
			[HTMLAttributes<HTMLElement>, Boxed<HTMLElement | null>]
		>;
		/**
		 * Determines the orientation of the composite.
		 */
		orientation?: "horizontal" | "vertical" | "both";
		/**
		 * Determines whether focus should loop around when navigating past the first
		 * or last item.
		 */
		loop?: boolean;
		/**
		 * Whether the direction of the composite’s navigation is in RTL layout.
		 */
		rtl?: boolean;
		/**
		 * Determines the number of columns there are in the composite
		 * (i.e. it’s a grid).
		 */
		cols?: number;
		/**
		 * Determines which items are disabled. The `disabled` or `aria-disabled`
		 * attributes are used by default.
		 */
		disabledIndices?: number[];
		/**
		 * Determines which item is active. Used to externally control the active
		 * item.
		 */
		activeIndex?: number;
		/**
		 * Called when the user navigates to a new item. Used to externally control
		 * the active item.
		 */
		onNavigate?(index: number): void;
		/**
		 * Only for `cols > 1`, specify sizes for grid items.
		 * `{ width: 2, height: 2 }` means an item is 2 columns wide and 2 rows tall.
		 */
		itemSizes?: Dimensions[];
		/**
		 * Only relevant for `cols > 1` and items with different sizes, specify if
		 * the grid is dense (as defined in the CSS spec for grid-auto-flow).
		 */
		dense?: boolean;
	}

	const horizontalKeys = [ARROW_LEFT, ARROW_RIGHT];
	const verticalKeys = [ARROW_UP, ARROW_DOWN];
	const allKeys = [...horizontalKeys, ...verticalKeys];

	export type { CompositeProps };
</script>

<script lang="ts">
	import FloatingList from "../floating-list/floating-list.svelte";
	import { box } from "../../internal/box.svelte.js";

	let {
		ref = $bindable(null),
		render,
		orientation = "both",
		loop = true,
		rtl = false,
		cols = 1,
		disabledIndices,
		activeIndex = 0,
		onNavigate: externalOnNavigate,
		itemSizes,
		dense = false,
		...rest
	}: HTMLAttributes<HTMLElement> & WithRef & CompositeProps = $props();

	let elements = $state<Array<HTMLDivElement | null>>([]);

	function onNavigate(index: number) {
		if (externalOnNavigate) {
			externalOnNavigate(index);
		}
		activeIndex = index;
	}

	CompositeContext.set({
		get activeIndex() {
			return activeIndex;
		},
		onNavigate,
	});

	const isGrid = $derived(cols > 1);

	function handleKeyDown(
		event: KeyboardEvent & { currentTarget: HTMLElement }
	) {
		if (!allKeys.includes(event.key)) return;

		let nextIndex = activeIndex;

		const minIndex = getMinIndex(elements, disabledIndices);
		const maxIndex = getMaxIndex(elements, disabledIndices);

		const horizontalEndKey = rtl ? ARROW_LEFT : ARROW_RIGHT;
		const horizontalStartKey = rtl ? ARROW_RIGHT : ARROW_LEFT;

		if (isGrid) {
			const sizes =
				itemSizes ||
				Array.from({ length: elements.length }, () => ({
					width: 1,
					height: 1,
				}));

			// To calculate movements on the grid, we use hypothetical cell indices
			// as if every item was 1x1, then convert back to real indices.
			const cellMap = buildCellMap(sizes, cols, dense);
			const minGridIndex = cellMap.findIndex(
				(index) =>
					index != null &&
					!isDisabled(elements, index, disabledIndices)
			);
			// last enabled index
			const maxGridIndex = cellMap.reduce(
				(foundIndex: number, index, cellIndex) =>
					index != null &&
					!isDisabled(elements, index, disabledIndices)
						? cellIndex
						: foundIndex,
				-1
			);

			const maybeNextIndex =
				cellMap[
					getGridNavigatedIndex(
						cellMap.map((itemIndex) =>
							itemIndex ? elements[itemIndex] : null
						),
						{
							event,
							orientation,
							loop,
							rtl,
							cols,
							// treat undefined (empty grid spaces) as disabled indices so we
							// don't end up in them
							disabledIndices: getCellIndices(
								[
									...(disabledIndices ||
										elements.map((_, index) =>
											isDisabled(elements, index)
												? index
												: undefined
										)),
									undefined,
								],
								cellMap
							),
							minIndex: minGridIndex,
							maxIndex: maxGridIndex,
							prevIndex: getCellIndexOfCorner(
								activeIndex > maxIndex ? minIndex : activeIndex,
								sizes,
								cellMap,
								cols,
								// use a corner matching the edge closest to the direction we're
								// moving in so we don't end up in the same item. Prefer
								// top/left over bottom/right.
								event.key === ARROW_DOWN
									? "bl"
									: event.key === horizontalEndKey
										? "tr"
										: "tl"
							),
						}
					)
				];

			if (maybeNextIndex != null) {
				nextIndex = maybeNextIndex;
			}
		}

		const toEndKeys = {
			horizontal: [horizontalEndKey],
			vertical: [ARROW_DOWN],
			both: [horizontalEndKey, ARROW_DOWN],
		}[orientation];

		const toStartKeys = {
			horizontal: [horizontalStartKey],
			vertical: [ARROW_UP],
			both: [horizontalStartKey, ARROW_UP],
		}[orientation];

		const preventedKeys = isGrid
			? allKeys
			: {
					horizontal: horizontalKeys,
					vertical: verticalKeys,
					both: allKeys,
				}[orientation];

		if (
			nextIndex === activeIndex &&
			[...toEndKeys, ...toStartKeys].includes(event.key)
		) {
			if (
				loop &&
				nextIndex === maxIndex &&
				toEndKeys.includes(event.key)
			) {
				nextIndex = minIndex;
			} else if (
				loop &&
				nextIndex === minIndex &&
				toStartKeys.includes(event.key)
			) {
				nextIndex = maxIndex;
			} else {
				nextIndex = findNonDisabledIndex(elements, {
					startingIndex: nextIndex,
					decrement: toStartKeys.includes(event.key),
					disabledIndices,
				});
			}
		}

		if (
			nextIndex !== activeIndex &&
			!isIndexOutOfBounds(elements, nextIndex)
		) {
			event.stopPropagation();

			if (preventedKeys.includes(event.key)) {
				event.preventDefault();
			}

			onNavigate(nextIndex);
			elements[nextIndex]?.focus();
		}
	}

	const mergedProps: HTMLAttributes<HTMLElement> = $derived({
		...rest,
		"aria-orientation": orientation === "both" ? undefined : orientation,
		onkeydown: (event) => {
			rest.onkeydown?.(event);
			handleKeyDown(event);
		},
	});

	const boxedRef = box.with(
		() => ref,
		(v) => (ref = v)
	);
</script>

<FloatingList bind:elements>
	{#if render}
		{@render render?.(mergedProps, boxedRef)}
	{:else}
		<div {...mergedProps} bind:this={boxedRef.current}>
			{@render mergedProps.children?.()}
		</div>
	{/if}
</FloatingList>
