import type { OpenChangeReason } from '$lib/types.js';
import {
	createPubSub,
	generateId,
	getDPR,
	noop,
	roundByDPR,
	styleObjectToString
} from '$lib/utils.js';
import {
	type Strategy,
	type Placement,
	type MiddlewareData,
	type ReferenceElement,
	type FloatingElement,
	type Middleware,
	type ComputePositionConfig,
	computePosition
} from '@floating-ui/dom';

interface FloatingElements {
	/**
	 * The reference element.
	 */
	reference?: ReferenceElement | null;

	/**
	 * The floating element.
	 */
	floating?: FloatingElement | null;
}

interface UseFloatingOptions {
	/**
	 * Represents the open/close state of the floating element.
	 * @default true
	 */
	readonly open?: boolean;

	/**
	 * Event handler that can be invoked whenever the open state changes.
	 */
	readonly onOpenChange?: (open: boolean, event?: Event, reason?: OpenChangeReason) => void;

	/**
	 * Where to place the floating element relative to its reference element.
	 * @default 'bottom'
	 */
	readonly placement?: Placement;

	/**
	 * The type of CSS position property to use.
	 * @default 'absolute'
	 */
	readonly strategy?: Strategy;

	/**
	 * These are plain objects that modify the positioning coordinates in some fashion, or provide useful data for the consumer to use.
	 * @default []
	 */
	readonly middleware?: Array<Middleware | undefined | null | false>;

	/**
	 * Whether to use `transform` instead of `top` and `left` styles to
	 * position the floating element (`floatingStyles`).
	 * @default true
	 */
	readonly transform?: boolean;

	/**
	 * The reference and floating elements.
	 * @default undefined
	 */
	readonly elements?: FloatingElements;

	/**
	 * Callback to handle mounting/unmounting of the elements.
	 * @default undefined
	 */
	readonly whileElementsMounted?: (
		reference: ReferenceElement,
		floating: FloatingElement,
		update: () => void
	) => () => void;
}

interface UseFloatingData {
	/**
	 * The x-coordinate of the floating element.
	 */
	x: number;

	/**
	 * The y-coordinate of the floating element.
	 */
	y: number;

	/**
	 * The stateful placement, which can be different from the initial `placement` passed as options.
	 */
	placement: Placement;

	/**
	 * The stateful strategy, which can be different from the initial `strategy` passed as options.
	 */
	strategy: Strategy;

	/**
	 * Additional data from middleware.
	 */
	middlewareData: MiddlewareData;

	/**
	 * The boolean that let you know if the floating element has been positioned.
	 */
	isPositioned: boolean;
}

interface FloatingEvents {
	emit<T extends string>(event: T, data?: unknown): void;
	on(event: string, handler: (data: unknown) => void): void;
	off(event: string, handler: (data: unknown) => void): void;
}

interface ContextData {
	openEvent?: Event;
}

interface FloatingContext extends UseFloatingData {
	open: boolean;
	onOpenChange(open: boolean, event?: Event, reason?: OpenChangeReason): void;
	events: FloatingEvents;
	data: ContextData;
	nodeId: string | undefined;
	floatingId: string;
	elements: FloatingElements;
}

interface UseFloatingReturn extends UseFloatingData {
	/**
	 * Represents the open/close state of the floating element.
	 */
	readonly open: boolean;

	/**
	 * CSS styles to apply to the floating element to position it.
	 */
	readonly floatingStyles: string;

	/**
	 * Updates the floating element position.
	 */
	readonly update: () => Promise<void>;

	/**
	 * Additional context meant for other hooks to consume.
	 */
	readonly context: FloatingContext;
}

/**
 * Hook for managing floating elements.
 */
function useFloating(options: UseFloatingOptions = {}): UseFloatingReturn {
	const floating = $derived(options.elements?.floating);
	const reference = $derived(options.elements?.reference);
	const placement = $derived(options.placement ?? 'bottom');
	const strategy = $derived(options.strategy ?? 'absolute');
	const middleware = $derived(options.middleware ?? []);
	const transform = $derived(options.transform ?? true);
	const open = $derived(options.open ?? true);
	const onOpenChange = $derived(options.onOpenChange ?? noop);
	const whileElementsMounted = $derived(options.whileElementsMounted);
	const floatingStyles = $derived.by(() => {
		const initialStyles = {
			position: strategy,
			left: '0px',
			top: '0px'
		};

		if (!floating) {
			return styleObjectToString(initialStyles);
		}

		const x = roundByDPR(floating, state.x);
		const y = roundByDPR(floating, state.y);

		if (transform) {
			return styleObjectToString({
				...initialStyles,
				transform: `translate(${x}px, ${y}px)`,
				...(getDPR(floating) >= 1.5 && { willChange: 'transform' })
			});
		}

		return styleObjectToString({
			position: strategy,
			left: `${x}px`,
			top: `${y}px`
		});
	});

	const state: UseFloatingData = $state({
		x: 0,
		y: 0,
		strategy,
		placement,
		middlewareData: {},
		isPositioned: false
	});

	const context: FloatingContext = $state({
		get x() {
			return state.x;
		},
		get y() {
			return state.y;
		},
		get placement() {
			return state.placement;
		},
		get strategy() {
			return state.strategy;
		},
		get middlewareData() {
			return state.middlewareData;
		},
		get isPositioned() {
			return state.isPositioned;
		},
		get open() {
			return open;
		},
		get onOpenChange() {
			return onOpenChange;
		},
		events: createPubSub(),
		data: {},
		// TODO: Ensure nodeId works the same way as in @floating-ui/react
		nodeId: undefined,
		// TODO: Ensure nodeId works the same way as in @floating-ui/react
		floatingId: generateId(),
		elements: {
			get floating() {
				return floating;
			},
			get reference() {
				return reference;
			}
		}
	});

	const update = async () => {
		if (!floating || !reference) {
			return;
		}

		const config: ComputePositionConfig = {
			placement,
			strategy,
			middleware
		};

		const position = await computePosition(reference, floating, config);

		state.x = position.x;
		state.y = position.y;
		state.placement = position.placement;
		state.strategy = position.strategy;
		state.middlewareData = position.middlewareData;
		state.isPositioned = true;
	};

	$effect.pre(() => {
		if (open || !state.isPositioned) {
			return;
		}

		state.isPositioned = false;
	});

	$effect.pre(() => {
		if (!floating || !reference) {
			return;
		}

		if (!whileElementsMounted) {
			update();
			return;
		}

		return whileElementsMounted(reference, floating, update);
	});

	return {
		get x() {
			return state.x;
		},
		get y() {
			return state.y;
		},
		get placement() {
			return state.placement;
		},
		get strategy() {
			return state.strategy;
		},
		get middlewareData() {
			return state.middlewareData;
		},
		get isPositioned() {
			return state.isPositioned;
		},
		get open() {
			return open;
		},
		get floatingStyles() {
			return floatingStyles;
		},
		update,
		context
	};
}

export { useFloating, type UseFloatingOptions, type UseFloatingReturn, type FloatingContext };
