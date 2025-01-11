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
import type { FloatingOptions } from "./use-floating.svelte.js";
import type { FloatingRootContext } from "./use-floating-root-context.svelte.js";

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

/**
 * Manages the positioning of floating elements.
 */
class PositionState<RT extends ReferenceType = ReferenceType> {
	referenceEl = $derived.by(
		() => this.getPositionReference() || this.options.reference.current || null,
	);
	data: UsePositionData = $state({
		x: 0,
		y: 0,
		strategy: "absolute",
		placement: "bottom",
		middlewareData: {},
		isPositioned: false,
	});
	floatingStyles = $derived.by(() => {
		const initialStyles = {
			position: this.options.strategy.current,
			left: "0px",
			top: "0px",
		};

		if (!this.options.floating.current) {
			return styleObjectToString(initialStyles);
		}

		const x = roundByDPR(this.options.floating.current, this.data.x);
		const y = roundByDPR(this.options.floating.current, this.data.y);

		if (this.options.transform.current) {
			return styleObjectToString({
				...initialStyles,
				transform: `translate(${x}px, ${y}px)`,
				...(getDPR(this.options.floating.current) >= 1.5 && {
					willChange: "transform",
				}),
			});
		}

		return styleObjectToString({
			position: this.options.strategy.current,
			left: `${x}px`,
			top: `${y}px`,
		});
	});

	constructor(
		private readonly options: FloatingOptions<RT>,
		private readonly rootContext: FloatingRootContext<RT>,
		// We use a getter to prevent having to expose the internal only
		// `#positionReference` property in `FloatingState` to the public API.
		private readonly getPositionReference: () => ReferenceType | null,
	) {
		this.data.strategy = this.options.strategy.current;
		this.data.placement = this.options.placement.current;
		$effect.pre(() => {
			if (this.rootContext.open || !this.data.isPositioned) return;

			this.data.isPositioned = false;
		});

		$effect.pre(() => {
			if (this.referenceEl && this.options.floating.current) {
				if (this.options?.whileElementsMounted) {
					return this.options.whileElementsMounted(
						this.referenceEl,
						this.options.floating.current,
						() => this.update(),
					);
				}

				this.update();
			}
		});
	}

	async update() {
		if (!this.referenceEl || !this.options.floating.current) return;

		const config: ComputePositionConfig = {
			placement: this.options.placement.current,
			strategy: this.options.strategy.current,
			middleware: this.options.middleware.current,
		};

		const position = await computePosition(
			this.referenceEl,
			this.options.floating.current,
			config,
		);

		this.data.x = position.x;
		this.data.y = position.y;
		this.data.placement = position.placement;
		this.data.strategy = position.strategy;
		this.data.middlewareData = position.middlewareData;
		this.data.isPositioned = this.rootContext.open !== false;
	}
}

export type { UsePositionOptions, UsePositionData };
export { PositionState };
