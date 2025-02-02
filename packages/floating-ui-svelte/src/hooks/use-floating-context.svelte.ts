import type {
	ContextData,
	FloatingEvents,
	OnOpenChange,
	ReferenceType,
} from "../types.js";
import type { FloatingRootContext } from "./use-floating-root-context.svelte.js";
import type { PositionState } from "./use-position.svelte.js";
import type { Placement, Strategy } from "@floating-ui/utils";
import type { MiddlewareData } from "@floating-ui/dom";
import type { FloatingOptions } from "./use-floating-options.svelte.js";
import type { FloatingState } from "./use-floating.svelte.js";

export interface FloatingContextOptions<
	RT extends ReferenceType = ReferenceType,
> {
	floatingState: Omit<FloatingState<RT>, "context">;
	floatingOptions: FloatingOptions<RT>;
	rootContext: FloatingRootContext<RT>;
	positionState: PositionState<RT>;
}

export interface FloatingContextData<RT extends ReferenceType = ReferenceType> {
	elements: {
		reference: ReferenceType | null;
		floating: HTMLElement | null;
		domReference: HTMLElement | null;
	};
	x: number;
	y: number;
	placement: Placement;
	strategy: Strategy;
	middlewareData: MiddlewareData;
	isPositioned: boolean;
	update: () => Promise<void>;
	floatingStyles: string;
	onOpenChange: OnOpenChange;
	open: boolean;
	data: ContextData<RT>;
	floatingId: string;
	events: FloatingEvents;
	nodeId: string | undefined;
	setPositionReference: (node: ReferenceType | null) => void;
	"~position": PositionState<RT>;
}

export function useFloatingContext<RT extends ReferenceType = ReferenceType>(
	opts: FloatingContextOptions<RT>,
): FloatingContextData<RT> {
	const elements = $state({
		get reference() {
			return opts.floatingOptions.reference.current as ReferenceType | null;
		},
		get floating() {
			return opts.floatingOptions.floating.current;
		},
		set floating(node: HTMLElement | null) {
			opts.floatingOptions.floating.current = node;
		},
		get domReference() {
			return opts.floatingState.elements.domReference;
		},
	});

	return {
		elements,
		get x() {
			return opts.floatingState.x;
		},
		get y() {
			return opts.floatingState.y;
		},
		get placement() {
			return opts.floatingState.placement;
		},
		get strategy() {
			return opts.floatingState.strategy;
		},
		get middlewareData() {
			return opts.floatingState.middlewareData;
		},
		get isPositioned() {
			return opts.floatingState.isPositioned;
		},
		get floatingStyles() {
			return opts.floatingState.floatingStyles;
		},
		get open() {
			return opts.rootContext.open;
		},
		get data() {
			return opts.rootContext.data;
		},
		get floatingId() {
			return opts.rootContext.floatingId;
		},
		get events() {
			return opts.rootContext.events;
		},
		get nodeId() {
			return opts.floatingOptions.nodeId.current;
		},
		onOpenChange: opts.rootContext.onOpenChange,
		update: opts.floatingState.update,
		setPositionReference: opts.floatingState.setPositionReference,
		"~position": opts.positionState,
	};
}
