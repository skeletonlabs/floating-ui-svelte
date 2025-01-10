import { isElement } from "@floating-ui/utils/dom";
import { useFloatingTree } from "../components/floating-tree/hooks.svelte.js";
import type {
	ContextData,
	ExtendedElements,
	FloatingEvents,
	FloatingTreeType,
	NarrowedElement,
	OpenChangeReason,
	ReferenceType,
} from "../types.js";
import { FloatingRootContext } from "./use-floating-root-context.svelte.js";
import {
	PositionState,
	type UsePositionOptions,
} from "./use-position.svelte.js";
import type { Placement, Strategy } from "@floating-ui/utils";
import type { MiddlewareData } from "@floating-ui/dom";

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

type FloatingContextOptions<RT extends ReferenceType = ReferenceType> = {
	floating: FloatingState<RT>;
	floatingOptions: UseFloatingOptions<RT>;
	rootContext: FloatingRootContext<RT>;
	getElements: (state: FloatingState<RT>) => ExtendedElements<RT>;
};

interface FloatingContextData<RT extends ReferenceType = ReferenceType> {
	elements: ExtendedElements<RT>;
	x: number;
	y: number;
	placement: Placement;
	strategy: Strategy;
	middlewareData: MiddlewareData;
	isPositioned: boolean;
	update: () => Promise<void>;
	floatingStyles: string;
	onOpenChange: (
		open: boolean,
		event?: Event,
		reason?: OpenChangeReason,
	) => void;
	open: boolean;
	data: ContextData<RT>;
	floatingId: string;
	events: FloatingEvents;
	nodeId: string | undefined;
}

class FloatingContext<RT extends ReferenceType = ReferenceType>
	implements FloatingContextData<RT>
{
	constructor(private readonly opts: FloatingContextOptions<RT>) {}

	get elements() {
		return this.opts.getElements(this.opts.floating);
	}

	get x() {
		return this.opts.floating.x;
	}

	get y() {
		return this.opts.floating.y;
	}

	get placement() {
		return this.opts.floating.placement;
	}

	get strategy() {
		return this.opts.floating.strategy;
	}

	get middlewareData() {
		return this.opts.floating.middlewareData;
	}

	get isPositioned() {
		return this.opts.floating.isPositioned;
	}

	get update() {
		return this.opts.floating.update;
	}

	get floatingStyles() {
		return this.opts.floating.floatingStyles;
	}

	get onOpenChange() {
		return this.opts.rootContext.onOpenChange;
	}

	get open() {
		return this.opts.rootContext.open;
	}

	get data() {
		return this.opts.rootContext.data;
	}

	get floatingId() {
		return this.opts.rootContext.floatingId;
	}

	get events() {
		return this.opts.rootContext.events;
	}

	get nodeId() {
		return this.opts.floatingOptions.nodeId;
	}
}

class FloatingState<RT extends ReferenceType = ReferenceType> {
	#rootContext: FloatingRootContext<RT>;
	#position: PositionState<RT>;
	#positionReference = $state<ReferenceType | null>(null);
	#domReference = $state<NarrowedElement<RT> | null>(null);
	#derivedDomReference = $derived.by(
		() =>
			(this.#rootContext.elements.domReference ||
				this.#domReference) as NarrowedElement<RT>,
	);
	#tree: FloatingTreeType<RT> | null;
	#nodeId = $derived.by(() => this.options.nodeId);
	context: FloatingContext<RT>;

	constructor(private readonly options: UseFloatingOptions<RT> = {}) {
		this.#rootContext =
			options.rootContext ??
			new FloatingRootContext({
				get open() {
					return options.open ?? true;
				},
				get elements() {
					const reference = options.elements?.reference ?? null;
					const floating = options.elements?.floating ?? null;
					return {
						reference,
						floating,
					};
				},
				get onOpenChange() {
					return options.onOpenChange;
				},
			});

		this.#tree = useFloatingTree();
		this.#position = new PositionState<RT>(
			options,
			this.#rootContext,
			() => this.#positionReference,
		);

		this.context = new FloatingContext({
			floating: this,
			floatingOptions: options,
			rootContext: this.#rootContext,
			getElements: this.#getElements,
		});

		$effect(() => {
			this.#rootContext.data.floatingContext = this.context;

			const node = this.#tree?.nodes.find((node) => node.id === this.#nodeId);
			if (node) {
				node.context = this.context;
			}
		});

		this.setPositionReference = this.setPositionReference.bind(this);
	}

	setPositionReference(node: ReferenceType | null) {
		const computedPositionReference = isElement(node)
			? {
					getBoundingClientRect: () => node.getBoundingClientRect(),
					contextElement: node,
				}
			: node;

		this.#positionReference = computedPositionReference;
	}

	setDomReference(node: NarrowedElement<RT> | null) {
		this.#domReference = node;
	}

	get placement() {
		return this.#position.data.placement;
	}

	get strategy() {
		return this.#position.data.strategy;
	}

	get middlewareData() {
		return this.#position.data.middlewareData;
	}

	get isPositioned() {
		return this.#position.data.isPositioned;
	}

	get x() {
		return this.#position.data.x;
	}

	get y() {
		return this.#position.data.y;
	}

	get floatingStyles() {
		return this.#position.floatingStyles;
	}

	get update() {
		return this.#position.update;
	}

	#getElements = (state: FloatingState<RT>) => {
		return {
			get reference() {
				return state.#position.reference as RT | null;
			},
			set reference(node: RT | null) {
				if (isElement(node) || node === null) {
					state.setDomReference(node as NarrowedElement<RT> | null);
				}
			},
			get floating() {
				return state.#rootContext.elements.floating;
			},
			set floating(node: HTMLElement | null) {
				state.#rootContext.elements.floating = node;
			},
			get domReference() {
				return state.#derivedDomReference;
			},
		};
	};

	readonly elements = $derived.by(() => {
		return this.#getElements(this);
	});
}

/**
 * Provides data to position a floating element and context to add interactions.
 */
function useFloating<RT extends ReferenceType = ReferenceType>(
	options: UseFloatingOptions<RT> = {},
): FloatingState<RT> {
	return new FloatingState<RT>(options);
}

export { FloatingState, FloatingContext, useFloating };
export type { UseFloatingOptions, FloatingContextData };
