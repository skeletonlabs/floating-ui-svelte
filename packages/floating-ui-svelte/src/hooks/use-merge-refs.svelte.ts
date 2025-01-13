import type { Boxed } from "../types.js";
import { FloatingState } from "./use-floating.svelte.js";

/**
 * Merges the references of either floating instances or refs into a single reference
 * that can be accessed and set via the `.current` property.
 */
class MergeRefs<T extends Element = Element> {
	#current = $state<T | null>(null);
	constructor(
		private readonly floatingOrRef: Array<
			FloatingState | Boxed<T | null> | null | undefined
		>,
	) {}

	get current() {
		return this.#current;
	}

	set current(node: T | null) {
		for (const arg of this.floatingOrRef) {
			if (!arg) continue;
			if (arg instanceof FloatingState) {
				arg.reference = node;
				continue;
			}
			arg.current = node;
		}
		this.#current = node;
	}
}

/**
 * Use the same reference for multiple floating instances at once.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useMergeRefs, useFloating, type BoxedRef } from "@skeletonlabs/floating-ui-svelte";
 *   const tooltip = useFloating();
 *   const menu = useFloating()
 *
 *   let someOtherRef: BoxedRef = $state({ current: null })
 *
 *   const tooltipInt = useInteractions([])
 *   const menuInt = useInteractions([])
 *
 *   const ref = useMergeRefs([tooltip, menu, someOtherRef])
 *   const props = $derived(tooltipInt.getReferenceProps(menuInt.getReferenceProps()))
 * </script>
 *
 * <button bind:this={ref.current} {...props}>
 * 	<!-- ... -->
 * </button>
 *```
 *
 *
 * @param floatingInstances
 * @returns
 */
function useMergeRefs<T extends Element = Element>(
	refLikes: Array<FloatingState | Boxed<T | null> | null | undefined>,
) {
	return new MergeRefs(refLikes);
}

export { MergeRefs, useMergeRefs };
