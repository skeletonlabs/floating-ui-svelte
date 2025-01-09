import { isElement } from "@floating-ui/utils/dom";
import { useFloatingTree } from "../components/floating-tree/hooks.svelte.js";
import type {
	ExtendedElements,
	FloatingContext,
	NarrowedElement,
	OpenChangeReason,
	ReferenceType,
} from "../types.js";
import {
	useFloatingRootContext,
	type FloatingRootContext,
} from "./use-floating-root-context.svelte.js";
import {
	usePosition,
	type UsePositionOptions,
	type UsePositionReturn,
} from "./use-position.svelte.js";

interface UseFloatingOptions<RT extends ReferenceType = ReferenceType>
	extends Omit<UsePositionOptions<RT>, "elements"> {
	rootContext?: FloatingRootContext<RT>;
	/**
	 * Object of external elements as an alternative to the `refs` object setters.
	 */
	elements?: {
		/**
		 * The reference element.
		 */
		reference?: Element | null;
		/**
		 * The floating element.
		 */
		floating?: HTMLElement | null;
	};
	/**
	 * An event callback that is invoked when the floating element is opened or
	 * closed.
	 */
	onOpenChange?(open: boolean, event?: Event, reason?: OpenChangeReason): void;
	/**
	 * Unique node id when using `FloatingTree`.
	 */
	nodeId?: string;
}

interface UseFloatingReturn<RT extends ReferenceType = ReferenceType>
	extends UsePositionReturn {
	/**
	 * `FloatingContext`
	 */
	context: FloatingContext<RT>;

	/**
	 * Set the position reference outside of the `elements`
	 * object.
	 */
	refs: {
		setPositionReference(node: ReferenceType | null): void;
	};

	/**
	 * The floating elements.
	 */
	elements: ExtendedElements<RT>;
}

/**
 * Provides data to position a floating element and context to add interactions.
 */

export function useFloating<RT extends ReferenceType = ReferenceType>(
	options: UseFloatingOptions = {},
): UseFloatingReturn<RT> {
	const elementsProp = $state({
		reference: options.elements?.reference ?? null,
		floating: options.elements?.floating ?? null,
		domReference: null as NarrowedElement<RT> | null,
	});

	$effect.pre(() => {
		if (!options.elements || !options.elements.reference) {
			return;
		}
		elementsProp.reference = options.elements.reference;
	});

	$effect.pre(() => {
		if (!options.elements || !options.elements.floating) {
			return;
		}
		elementsProp.floating = options.elements.floating;
	});

	const { nodeId } = options;

	const internalRootContext = useFloatingRootContext({
		get open() {
			if (options.open === undefined) return true;
			return options.open;
		},
		get elements() {
			return {
				reference: options.elements?.reference ?? null,
				floating: options.elements?.floating ?? null,
			};
		},
	});

	const rootContext = options.rootContext ?? internalRootContext;
	const computedElements = $derived(rootContext.elements);

	let _domReference = $state<NarrowedElement<RT> | null>(null);
	let positionReference = $state<ReferenceType | null>(null);
	const optionDomReference = $derived(computedElements.domReference);
	const domReference = $derived(
		optionDomReference ?? _domReference,
	) as NarrowedElement<RT>;

	const tree = useFloatingTree();

	$effect.pre(() => {
		if (domReference) {
			elementsProp.domReference = domReference;
		}
	});

	const position = usePosition({
		...options,
		elements: {
			get floating() {
				return computedElements.floating;
			},
			get reference() {
				if (positionReference) {
					return positionReference;
				}
				return computedElements.reference;
			},
		},
	});

	const elements = $state({
		get reference() {
			return position.elements.reference;
		},
		set reference(node: ReferenceType | null) {
			if (isElement(node) || node === null) {
				(_domReference as Element | null) = node;
			}
		},
		get floating() {
			return position.elements.floating;
		},
		set floating(node: HTMLElement | null) {
			elementsProp.floating = node;
		},
		get domReference() {
			return domReference;
		},
	});

	const context = $state<FloatingContext<RT>>({
		get x() {
			return position.x;
		},
		get y() {
			return position.y;
		},
		get placement() {
			return position.placement;
		},
		get strategy() {
			return position.strategy;
		},
		get middlewareData() {
			return position.middlewareData;
		},
		get isPositioned() {
			return position.isPositioned;
		},
		update: position.update,
		get floatingStyles() {
			return position.floatingStyles;
		},
		data: rootContext.data,
		floatingId: rootContext.floatingId,
		events: rootContext.events,
		elements,
		nodeId,
		onOpenChange: rootContext.onOpenChange,
		get open() {
			return rootContext.open;
		},
	});

	$effect(() => {
		rootContext.data.floatingContext = context;

		const node = tree?.nodes.find((node) => node.id === nodeId);
		if (node) {
			node.context = context;
		}
	});

	return {
		context,
		elements,
		update: position.update,
		get x() {
			return position.x;
		},
		get y() {
			return position.y;
		},
		get placement() {
			return position.placement;
		},
		get strategy() {
			return position.strategy;
		},
		get middlewareData() {
			return position.middlewareData;
		},
		get isPositioned() {
			return position.isPositioned;
		},
		get floatingStyles() {
			return position.floatingStyles;
		},
		refs: {
			setPositionReference: (node: ReferenceType | null) => {
				const computedPositionReference = isElement(node)
					? {
							getBoundingClientRect: () => node.getBoundingClientRect(),
							contextElement: node,
						}
					: node;
				positionReference = computedPositionReference;
			},
		},
	};
}
