import { useFloatingTree } from "../components/floating-tree/hooks.svelte.js";
import type {
	ContextData,
	FloatingEvents,
	FloatingTreeType,
	MaybeGetter,
	NarrowedElement,
	OnOpenChange,
	OpenChangeReason,
	ReferenceType,
	WhileElementsMounted,
} from "../types.js";
import {
	type FloatingRootContext,
	useFloatingRootContext,
} from "./use-floating-root-context.svelte.js";
import { PositionState } from "./use-position.svelte.js";
import type { Placement, Strategy } from "@floating-ui/utils";
import type { Middleware, MiddlewareData } from "@floating-ui/dom";
import {
	box,
	type ReadableBox,
	type WritableBox,
} from "../internal/box.svelte.js";
import { extract } from "../internal/extract.js";
import { noop } from "../internal/noop.js";
import { isElement } from "@floating-ui/utils/dom";

interface UseFloatingOptions<RT extends ReferenceType = ReferenceType> {
	/**
	 * Represents the open/close state of the floating element.
	 * @default true
	 */
	open?: MaybeGetter<boolean>;

	/**
	 * Where to place the floating element relative to its reference element.
	 * @default 'bottom'
	 */
	placement?: MaybeGetter<Placement | undefined>;

	/**
	 * The type of CSS position property to use.
	 * @default 'absolute'
	 */
	strategy?: MaybeGetter<Strategy>;

	/**
	 * These are plain objects that modify the positioning coordinates in some fashion, or provide useful data for the consumer to use.
	 * @default []
	 */
	middleware?: MaybeGetter<Array<Middleware | undefined | null | false>>;

	/**
	 * Whether to use `transform` instead of `top` and `left` styles to
	 * position the floating element (`floatingStyles`).
	 * @default true
	 */
	transform?: MaybeGetter<boolean>;

	/**
	 * Callback to handle mounting/unmounting of the elements.
	 * @default undefined
	 */
	whileElementsMounted?: WhileElementsMounted;

	rootContext?: MaybeGetter<FloatingRootContext<RT>>;
	/**
	 * The reference element.
	 */
	reference?: MaybeGetter<Element | null>;
	/**
	 * A callback that is invoked when the reference element changes.
	 */
	onReferenceChange?(node: Element | null): void;
	/**
	 * The floating element.
	 */
	floating?: MaybeGetter<HTMLElement | null>;

	/**
	 * A callback that is invoked when the floating element changes.
	 */
	onFloatingChange?(node: HTMLElement | null): void;

	/**
	 * An event callback that is invoked when the floating element is opened or
	 * closed.
	 */
	onOpenChange?(open: boolean, event?: Event, reason?: OpenChangeReason): void;
	/**
	 * Unique node id when using `FloatingTree`.
	 */
	nodeId?: MaybeGetter<string | undefined>;
}

/**
 * An instance of `FloatingOptions` is created for each call to `useFloating`,
 * and is used to store the reactive state of the various options passed to
 * `useFloating`.
 */
// This enables us to not have to pass around a bunch of getters and setters internally
// and can instead rely on the reactive state of the `FloatingOptions` instance.
class FloatingOptions<RT extends ReferenceType = ReferenceType> {
	open: ReadableBox<boolean>;
	placement: ReadableBox<Placement>;
	strategy: ReadableBox<Strategy>;
	middleware: ReadableBox<Array<Middleware | undefined | null | false>>;
	transform: ReadableBox<boolean>;
	whileElementsMounted: WhileElementsMounted | undefined;
	rootContext: ReadableBox<FloatingRootContext<RT> | undefined>;
	onReferenceChange: (node: Element | null) => void;
	onFloatingChange: (node: HTMLElement | null) => void;
	onOpenChange: (
		open: boolean,
		event?: Event,
		reason?: OpenChangeReason,
	) => void;
	nodeId: ReadableBox<string | undefined>;

	#stableReference = $state<Element | null>(null);
	#stableFloating = $state<HTMLElement | null>(null);
	reference: WritableBox<Element | null>;
	floating: WritableBox<HTMLElement | null>;
	constructor(private readonly options: UseFloatingOptions<RT>) {
		const floatingProp = $derived.by(() =>
			extract(this.options.floating, null),
		);
		const referenceProp = $derived.by(() =>
			extract(this.options.reference, null),
		);
		this.open = box.with(() => extract(options.open, true));
		this.placement = box.with(() => extract(options.placement, "bottom"));
		this.strategy = box.with(() => extract(options.strategy, "absolute"));
		this.middleware = box.with(() => extract(options.middleware, []));
		this.transform = box.with(() => extract(options.transform, true));
		this.onOpenChange = options.onOpenChange ?? noop;
		this.onReferenceChange = options.onReferenceChange ?? noop;
		this.onFloatingChange = options.onFloatingChange ?? noop;
		this.whileElementsMounted = options.whileElementsMounted;
		this.nodeId = box.with(() => extract(options.nodeId));
		this.rootContext = box.with(
			() => extract(options.rootContext) as FloatingRootContext<RT> | undefined,
		);
		this.reference = box.with(
			() => this.#stableReference,
			(node) => {
				this.#stableReference = node;
				this.onReferenceChange(node);
			},
		);
		this.floating = box.with(
			() => this.#stableFloating,
			(node) => {
				this.#stableFloating = node;
				this.onFloatingChange(node);
			},
		);
		this.reference.current = extract(this.options.reference, null);
		this.floating.current = extract(this.options.floating, null);

		$effect.pre(() => {
			if (floatingProp) {
				this.floating.current = floatingProp;
			}
		});

		$effect.pre(() => {
			if (referenceProp) {
				this.reference.current = referenceProp;
			}
		});
	}
}

type FloatingContextOptions<RT extends ReferenceType = ReferenceType> = {
	floating: FloatingState<RT>;
	floatingOptions: FloatingOptions<RT>;
	rootContext: FloatingRootContext<RT>;
};

interface FloatingContextData<RT extends ReferenceType = ReferenceType> {
	reference: ReferenceType | null;
	floating: HTMLElement | null;
	domReference: HTMLElement | null;
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
}

class FloatingContext<RT extends ReferenceType = ReferenceType>
	implements FloatingContextData<RT>
{
	onOpenChange: OnOpenChange;
	update: () => Promise<void>;
	setPositionReference: (node: ReferenceType | null) => void;

	constructor(private readonly opts: FloatingContextOptions<RT>) {
		this.onOpenChange = this.opts.rootContext.onOpenChange;
		this.update = this.opts.floating.update;
		this.setPositionReference = this.opts.floating.setPositionReference;
	}

	get reference() {
		return this.opts.floatingOptions.reference.current as ReferenceType | null;
	}

	get floating() {
		return this.opts.floatingOptions.floating.current;
	}

	set floating(node: HTMLElement | null) {
		this.opts.floatingOptions.floating.current = node;
	}

	get domReference() {
		return this.opts.floating.domReference;
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

	get floatingStyles() {
		return this.opts.floating.floatingStyles;
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
		return this.opts.floatingOptions.nodeId.current;
	}
}

class FloatingState<RT extends ReferenceType = ReferenceType> {
	#rootContext: FloatingRootContext<RT>;
	#position: PositionState<RT>;
	#positionReference = $state<ReferenceType | null>(null);
	#derivedDomReference = $derived.by(
		() =>
			(this.#rootContext.domReference ||
				this.options.reference.current) as NarrowedElement<RT>,
	);
	#tree: FloatingTreeType<RT> | null;
	context: FloatingContext<RT>;

	constructor(private readonly options: FloatingOptions<RT>) {
		const internalRootContext = useFloatingRootContext({
			open: () => options.open.current ?? true,
			reference: () => options.reference.current,
			floating: () => options.floating.current,
			onOpenChange: options.onOpenChange,
		});

		this.#rootContext =
			options.rootContext.current ??
			(internalRootContext as unknown as FloatingRootContext<RT>);

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
		});

		$effect(() => {
			this.#rootContext.data.floatingContext = this.context;

			const node = this.#tree?.nodes.find(
				(node) => node.id === this.options.nodeId.current,
			);
			if (node) {
				node.context = this.context;
			}
		});
	}

	setPositionReference = (node: ReferenceType | null) => {
		const computedPositionReference = isElement(node)
			? {
					getBoundingClientRect: () => node.getBoundingClientRect(),
					contextElement: node,
				}
			: node;
		this.#positionReference = computedPositionReference;
	};

	get domReference() {
		return this.#derivedDomReference as HTMLElement | null;
	}

	get reference() {
		return this.#position.referenceEl as RT | null;
	}

	set reference(node: RT | null) {
		if (isElement(node) || node === null) {
			this.options.reference.current = node;
		}
	}

	get floating() {
		return this.options.floating.current;
	}

	set floating(node: HTMLElement | null) {
		this.options.floating.current = node;
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
}

/**
 * Provides data to position a floating element and context to add interactions.
 */
function useFloating<RT extends ReferenceType = ReferenceType>(
	options: UseFloatingOptions<RT> = {},
): FloatingState<RT> {
	const optionsState = new FloatingOptions(options);
	return new FloatingState<RT>(optionsState);
}

export { FloatingState, FloatingContext, useFloating };
export type { UseFloatingOptions, FloatingContextData, FloatingOptions };
