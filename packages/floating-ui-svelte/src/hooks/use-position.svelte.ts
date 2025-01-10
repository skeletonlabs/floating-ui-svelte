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
import type {
	FloatingState,
	UseFloatingOptions,
} from "./use-floating.svelte.js";
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
	#strategy: Strategy = $derived.by(() => this.options.strategy ?? "absolute");
	#placement: Placement = $derived.by(() => this.options.placement ?? "bottom");
	#middleware: Array<Middleware | undefined | null | false> = $derived.by(
		() => this.options.middleware ?? [],
	);
	#transform: boolean = $derived.by(() => this.options.transform ?? true);
	#positionReference = $derived.by(() => this.getPositionReference());

	reference = $derived.by(
		() => this.#positionReference ?? this.rootContext.elements.reference,
	);

	data: UsePositionData = $state({
		x: 0,
		y: 0,
		strategy: this.#strategy,
		placement: this.#placement,
		middlewareData: {},
		isPositioned: false,
	});
	floatingStyles = $derived.by(() => {
		const initialStyles = {
			position: this.#strategy,
			left: "0px",
			top: "0px",
		};

		if (!this.rootContext.elements.floating) {
			return styleObjectToString(initialStyles);
		}

		const x = roundByDPR(this.rootContext.elements.floating, this.data.x);
		const y = roundByDPR(this.rootContext.elements.floating, this.data.y);

		if (this.#transform) {
			return styleObjectToString({
				...initialStyles,
				transform: `translate(${x}px, ${y}px)`,
				...(getDPR(this.rootContext.elements.floating) >= 1.5 && {
					willChange: "transform",
				}),
			});
		}

		return styleObjectToString({
			position: this.options.strategy,
			left: `${x}px`,
			top: `${y}px`,
		});
	});

	constructor(
		private readonly options: UseFloatingOptions<RT>,
		private readonly rootContext: FloatingRootContext<RT>,
		// We use a getter to prevent having to expose the internal only
		// `#positionReference` property in `FloatingState` to the public API.
		private readonly getPositionReference: () => ReferenceType | null,
	) {
		$effect.pre(() => {
			if (this.rootContext.open || !this.data.isPositioned) {
				return;
			}

			this.data.isPositioned = false;
		});

		$effect.pre(() => {
			if (!this.rootContext.elements.floating || !this.reference) {
				return;
			}

			if (!this.options.whileElementsMounted) {
				this.update();
				return;
			}

			return this.options.whileElementsMounted(
				this.reference as RT,
				this.rootContext.elements.floating,
				this.update,
			);
		});
	}

	update = async () => {
		if (!this.rootContext.elements.floating || !this.reference) {
			return;
		}

		const config: ComputePositionConfig = {
			placement: this.#placement,
			strategy: this.#strategy,
			middleware: this.#middleware,
		};

		const position = await computePosition(
			this.reference,
			this.rootContext.elements.floating,
			config,
		);

		this.data.x = position.x;
		this.data.y = position.y;
		this.data.placement = position.placement;
		this.data.strategy = position.strategy;
		this.data.middlewareData = position.middlewareData;
		this.data.isPositioned = true;
	};
}

export type { UsePositionOptions, UsePositionData };
export { PositionState };
