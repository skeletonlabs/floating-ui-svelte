import {
	type ComputePositionConfig,
	type Middleware,
	type MiddlewareData,
	type Placement,
	type Strategy,
	computePosition,
} from "@floating-ui/dom";
import { getDPR, roundByDPR } from "../internal/dpr.js";
import { styleObjectToString } from "../internal/style-object-to-string.js";
import type { ReferenceType } from "../types.js";

interface PositionElements<RT extends ReferenceType = ReferenceType> {
	/**
	 * The reference element.
	 */
	reference?: RT | null;

	/**
	 * The floating element.
	 */
	floating?: HTMLElement | null;
}

interface UsePositionOptions<RT extends ReferenceType = ReferenceType> {
	/**
	 * Represents the open/close state of the floating element.
	 * @default true
	 */
	open?: boolean;

	/**
	 * Where to place the floating element relative to its reference element.
	 * @default 'bottom'
	 */
	placement?: Placement;

	/**
	 * The type of CSS position property to use.
	 * @default 'absolute'
	 */
	strategy?: Strategy;

	/**
	 * These are plain objects that modify the positioning coordinates in some fashion, or provide useful data for the consumer to use.
	 * @default []
	 */
	middleware?: Array<Middleware | undefined | null | false>;

	/**
	 * Whether to use `transform` instead of `top` and `left` styles to
	 * position the floating element (`floatingStyles`).
	 * @default true
	 */
	transform?: boolean;

	/**
	 * Object containing the floating and reference elements.
	 * @default {}
	 */
	elements?: PositionElements<RT>;

	/**
	 * Callback to handle mounting/unmounting of the elements.
	 * @default undefined
	 */
	whileElementsMounted?: (
		reference: RT,
		floating: HTMLElement,
		update: () => void,
	) => () => void;
}

interface UsePositionData {
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

interface UsePositionReturn<RT extends ReferenceType = ReferenceType>
	extends UsePositionData {
	/**
	 * The reference and floating elements.
	 */
	readonly elements: Required<PositionElements<RT>>;

	/**
	 * CSS styles to apply to the floating element to position it.
	 */
	readonly floatingStyles: string;

	/**
	 * Updates the floating element position.
	 */
	readonly update: () => Promise<void>;
}

/**
 * Hook for managing floating elements.
 */
function usePosition<RT extends ReferenceType = ReferenceType>(
	options: UsePositionOptions = {},
): UsePositionReturn<RT> {
	const elements = $state({
		reference: (options.elements?.reference ?? null) as RT | null,
		floating: options.elements?.floating ?? null,
	});
	const {
		placement = "bottom",
		strategy = "absolute",
		middleware = [],
		transform = true,
		open = true,
		whileElementsMounted,
	} = $derived(options);
	const floatingStyles = $derived.by(() => {
		const initialStyles = {
			position: strategy,
			left: "0px",
			top: "0px",
		};

		if (!elements.floating) {
			return styleObjectToString(initialStyles);
		}

		const x = roundByDPR(elements.floating, state.x);
		const y = roundByDPR(elements.floating, state.y);

		if (transform) {
			return styleObjectToString({
				...initialStyles,
				transform: `translate(${x}px, ${y}px)`,
				...(getDPR(elements.floating) >= 1.5 && { willChange: "transform" }),
			});
		}

		return styleObjectToString({
			position: strategy,
			left: `${x}px`,
			top: `${y}px`,
		});
	});

	const state: UsePositionData = $state({
		x: 0,
		y: 0,
		strategy,
		placement,
		middlewareData: {},
		isPositioned: false,
	});

	const update = async () => {
		if (!elements.floating || !elements.reference) {
			return;
		}

		const config: ComputePositionConfig = {
			placement,
			strategy,
			middleware,
		};

		const position = await computePosition(
			elements.reference,
			elements.floating,
			config,
		);

		state.x = position.x;
		state.y = position.y;
		state.placement = position.placement;
		state.strategy = position.strategy;
		state.middlewareData = position.middlewareData;
		state.isPositioned = true;
	};

	$effect.pre(() => {
		if (!options.elements || !options.elements.reference) {
			return;
		}
		elements.reference = options.elements.reference as RT;
	});

	$effect.pre(() => {
		if (!options.elements || !options.elements.floating) {
			return;
		}
		elements.floating = options.elements.floating;
	});

	$effect.pre(() => {
		if (open || !state.isPositioned) {
			return;
		}

		state.isPositioned = false;
	});

	$effect.pre(() => {
		if (!elements.floating || !elements.reference) {
			return;
		}

		if (!whileElementsMounted) {
			update();
			return;
		}

		return whileElementsMounted(elements.reference, elements.floating, update);
	});

	return {
		update,
		elements,
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
		get floatingStyles() {
			return floatingStyles;
		},
	};
}

export type { UsePositionOptions, UsePositionReturn, UsePositionData };
export { usePosition };
