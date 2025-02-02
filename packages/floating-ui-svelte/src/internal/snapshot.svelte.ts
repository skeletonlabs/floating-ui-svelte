import type { FloatingContextData } from "../hooks/use-floating-context.svelte.js";
import type { ReferenceType } from "../types.js";

// TODO: consider the following:
// Is it worth it to include this as part of the `FloatingContext` instance?
// So users can call context.snapshot() and get an object?
function snapshotFloatingContext<RT extends ReferenceType = ReferenceType>(
	context: FloatingContextData<RT>,
) {
	return {
		get current(): FloatingContextData<RT> {
			return {
				elements: {
					reference: context.elements.reference,
					floating: context.elements.floating,
					domReference: context.elements.domReference,
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
				setPositionReference: context.setPositionReference,
				"~position": context["~position"],
			};
		},
	};
}

export { snapshotFloatingContext };
