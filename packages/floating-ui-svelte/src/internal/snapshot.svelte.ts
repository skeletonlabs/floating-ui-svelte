import type {
	FloatingContext,
	FloatingContextData,
} from "../hooks/use-floating.svelte.js";
import type { ReferenceType } from "../types.js";

// TODO: consider the following:
// Is it worth it to include this as part of the `FloatingContext` instance?
// So users can call context.snapshot() and get an object?
function snapshotFloatingContext<RT extends ReferenceType = ReferenceType>(
	context: FloatingContext<RT>,
) {
	return {
		get current(): FloatingContextData<RT> {
			return {
				elements: {
					domReference: context.elements.domReference,
					floating: context.elements.floating,
					reference: context.elements.reference,
				},
				x: context.x,
				y: context.y,
				placement: context.placement,
				strategy: context.strategy,
				middlewareData: context.middlewareData,
				isPositioned: context.isPositioned,
				update: context.update,
				floatingStyles: context.floatingStyles,
				onOpenChange: context.onOpenChange,
				open: context.open,
				data: context.data,
				floatingId: context.floatingId,
				events: context.events,
				nodeId: context.nodeId,
			};
		},
	};
}

export { snapshotFloatingContext };
