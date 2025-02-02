import { useFloatingTree } from "../components/floating-tree/hooks.svelte.js";
import type { NarrowedElement, ReferenceType } from "../types.js";
import {
	type FloatingRootContext,
	useFloatingRootContext,
} from "./use-floating-root-context.svelte.js";
import { isElement } from "@floating-ui/utils/dom";
import {
	useFloatingOptions,
	type UseFloatingOptions,
} from "./use-floating-options.svelte.js";
import { usePosition } from "./use-position.svelte.js";
import {
	useFloatingContext,
	type FloatingContextData,
} from "./use-floating-context.svelte.js";
import type { Placement } from "@floating-ui/utils";
import type { Strategy } from "@floating-ui/utils";
import type { MiddlewareData } from "@floating-ui/dom";

export interface FloatingState<RT extends ReferenceType = ReferenceType> {
	elements: {
		domReference: HTMLElement | null;
		reference: Element | null;
		floating: HTMLElement | null;
	};
	placement: Placement;
	strategy: Strategy;
	middlewareData: MiddlewareData;
	isPositioned: boolean;
	x: number;
	y: number;
	floatingStyles: string;
	update: () => Promise<void>;
	setPositionReference: (node: ReferenceType | null) => void;
	context: FloatingContextData<RT>;
}

/**
 * Provides data to position a floating element and context to add interactions.
 */
export function useFloating<RT extends ReferenceType = ReferenceType>(
	_opts: UseFloatingOptions<RT> = {},
) {
	const opts = useFloatingOptions(_opts);
	const internalRootContext = useFloatingRootContext({
		open: () => opts.open.current ?? true,
		reference: () => opts.reference.current,
		floating: () => opts.floating.current,
		onOpenChange: opts.onOpenChange,
		floatingId: () => opts.floatingId.current,
	});
	const rootContext = (opts.rootContext.current ??
		internalRootContext) as unknown as FloatingRootContext<RT>;
	const tree = useFloatingTree();
	let positionReference = $state<ReferenceType | null>(null);
	const position = usePosition<RT>(
		opts,
		rootContext,
		() => positionReference as RT | null,
	);
	const derivedDomReference = $derived(
		(rootContext.elements.domReference ||
			opts.reference.current) as NarrowedElement<RT>,
	);

	const floatingState = {
		elements: {
			get domReference() {
				return derivedDomReference as HTMLElement | null;
			},
			get reference() {
				return position.referenceEl as Element | null;
			},
			set reference(node: Element | null) {
				if (isElement(node) || node === null) {
					opts.reference.current = node;
				}
			},
			get floating() {
				return opts.floating.current;
			},
			set floating(node: HTMLElement | null) {
				opts.floating.current = node;
			},
		},
		get placement() {
			return position.data.placement;
		},
		get strategy() {
			return position.data.strategy;
		},
		get middlewareData() {
			return position.data.middlewareData;
		},
		get isPositioned() {
			return position.data.isPositioned;
		},
		get x() {
			return position.data.x;
		},
		get y() {
			return position.data.y;
		},
		get floatingStyles() {
			return position.floatingStyles;
		},
		update: position.update,
		setPositionReference: (node: ReferenceType | null) => {
			const computedPositionReference = isElement(node)
				? {
						getBoundingClientRect: () => node.getBoundingClientRect(),
						contextElement: node,
					}
				: node;
			positionReference = computedPositionReference;
		},
	};

	const context = useFloatingContext<RT>({
		floatingState: floatingState,
		floatingOptions: opts,
		rootContext,
		positionState: position,
	});

	Object.assign(floatingState, { context });

	$effect.pre(() => {
		rootContext.data.floatingContext = context;

		const node = tree?.nodes.find((node) => node.id === opts.nodeId.current);
		if (node) {
			node.context = context;
		}
	});

	return floatingState as FloatingState<RT>;
}
