import type {
	MaybeGetter,
	OpenChangeReason,
	ReferenceType,
	WhileElementsMounted,
} from "../types.js";
import type { FloatingRootContext } from "./use-floating-root-context.svelte.js";
import type { Placement, Strategy } from "@floating-ui/utils";
import type { Middleware } from "@floating-ui/dom";
import { box } from "../internal/box.svelte.js";
import { extract } from "../internal/extract.js";
import { noop } from "../internal/noop.js";
import { useId } from "./use-id.js";

export interface UseFloatingOptions<RT extends ReferenceType = ReferenceType> {
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
	elements?: {
		/**
		 * The reference element.
		 */
		reference?: MaybeGetter<Element | null>;
		/**
		 * The floating element.
		 */
		floating?: MaybeGetter<HTMLElement | null>;
	};

	/**
	 * A callback that is invoked when the reference element changes.
	 */
	onReferenceChange?(node: Element | null): void;

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

	/**
	 * A unique id for the floating element.
	 *
	 * @default useId()
	 */
	floatingId?: MaybeGetter<string | undefined | null>;
}

export interface FloatingOptions<RT extends ReferenceType = ReferenceType>
	extends ReturnType<typeof useFloatingOptions<RT>> {}

/**
 * Returns reactive options state to use with the various internal hooks.
 */
export function useFloatingOptions<RT extends ReferenceType = ReferenceType>(
	options: UseFloatingOptions<RT>,
) {
	const floatingId = box.with(() => extract(options.floatingId) ?? useId());
	const floatingProp = $derived(extract(options.elements?.floating, null));
	const referenceProp = $derived(extract(options.elements?.reference, null));
	const open = box.with(() => extract(options.open, true));
	const placement = box.with(() => extract(options.placement, "bottom"));
	const strategy = box.with(() => extract(options.strategy, "absolute"));
	const middleware = box.with(() => extract(options.middleware, []));
	const transform = box.with(() => extract(options.transform, true));
	const onOpenChange = options.onOpenChange ?? noop;
	const onReferenceChange = options.onReferenceChange ?? noop;
	const onFloatingChange = options.onFloatingChange ?? noop;
	const whileElementsMounted = options.whileElementsMounted;
	const nodeId = box.with(() => extract(options.nodeId));
	const rootContext = box.with(
		() => extract(options.rootContext) as FloatingRootContext<RT> | undefined,
	);
	let _stableReference = $state<Element | null>(null);
	let _stableFloating = $state<HTMLElement | null>(null);
	const reference = box.with(
		() => _stableReference,
		(node) => {
			_stableReference = node;
			onReferenceChange(node);
		},
	);
	const floating = box.with(
		() => _stableFloating,
		(node) => {
			_stableFloating = node;
			onFloatingChange(node);
		},
	);
	reference.current = extract(options.elements?.reference, null);
	floating.current = extract(options.elements?.floating, null);

	$effect.pre(() => {
		if (!floatingProp) return;
		floating.current = floatingProp;
	});

	$effect.pre(() => {
		if (!referenceProp) return;
		reference.current = referenceProp;
	});

	return {
		open,
		placement,
		strategy,
		middleware,
		transform,
		whileElementsMounted,
		rootContext,
		floatingId,
		onReferenceChange,
		onFloatingChange,
		onOpenChange,
		nodeId,
		reference,
		floating,
	};
}
