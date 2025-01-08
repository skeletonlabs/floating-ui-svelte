import { isElement } from "@floating-ui/utils/dom";
import { useFloatingTree } from "../components/floating-tree/hooks.svelte.js";
import type {
	NarrowedElement,
	OpenChangeReason,
	ReferenceType,
} from "../types.js";
import {
	useFloatingRootContext,
	type FloatingRootContext,
} from "./use-floating-root-context.svelte.js";
import { usePosition, type UsePositionOptions } from "./use-position.svelte.js";

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

/**
 * Provides data to position a floating element and context to add interactions.
 */

export function useFloating<RT extends ReferenceType = ReferenceType>(
	options: UseFloatingOptions = {},
) {
	const elements = $state({
		reference: options.elements?.reference ?? null,
		floating: options.elements?.floating ?? null,
		domReference: null as NarrowedElement<RT> | null,
	});
	const { nodeId } = options;

	const internalRootContext = useFloatingRootContext({
		...options,
		elements: elements,
	});

	const rootContext = options.rootContext ?? internalRootContext;
	const computedElements = rootContext.elements;

	let _domReference = $state<NarrowedElement<RT> | null>(null);
	let positionReference = $state<ReferenceType | null>(null);
	const optionDomReference = $derived(computedElements.domReference);
	const domReference = $derived(
		optionDomReference ?? _domReference,
	) as NarrowedElement<RT>;

	const tree = useFloatingTree();

	$effect.pre(() => {
		if (domReference) {
			elements.domReference = domReference;
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

	function setPositionReference(node: ReferenceType | null) {
		const computedPositionReference = isElement(node)
			? {
					getBoundingClientRect: () => node.getBoundingClientRect(),
					contextElement: node,
				}
			: node;
		positionReference = computedPositionReference;
	}

	function setReference(node: RT | null) {
		if (isElement(node) || node === null) {
			(_domReference as Element | null) = node;
		}
	}
}
