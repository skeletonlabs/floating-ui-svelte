import type { OpenChangeReason } from '$lib/types.js';
import { getDPR, noop, roundByDPR, styleObjectToString } from '$lib/utils.js';
import {
	computePosition,
	type Strategy,
	type Placement,
	type MiddlewareData,
	type ReferenceElement,
	type FloatingElement,
	type Middleware
} from '@floating-ui/dom';

type FloatingElements = {
	/**
	 * The reference element.
	 */
	readonly reference?: ReferenceElement | null;

	/**
	 * The floating element which is anchored to the reference element.
	 */
	readonly floating?: FloatingElement | null;
};

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
	 * @default undefined
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

class UseFloating {
	readonly #options: UseFloatingOptions;

	constructor(options: UseFloatingOptions) {
		this.#options = options;
		this.#placement = this.#placementOption;
		this.#strategy = this.#strategyOption;

		$effect.pre(this.#update);
		$effect.pre(this.#attach);
		$effect.pre(this.#reset);
	}

	#open = $derived.by(() => this.#options.open ?? true);
	#onOpenChange = $derived.by(() => this.#options.onOpenChange ?? noop);
	#placementOption = $derived.by(() => this.#options.placement ?? 'bottom');
	#strategyOption = $derived.by(() => this.#options.strategy ?? 'absolute');
	#middleware = $derived.by(() => this.#options.middleware);
	#transform = $derived.by(() => this.#options.transform ?? true);
	#elements = $derived.by(() => this.#options.elements ?? {});
	#whileElementsMounted = $derived.by(() => this.#options.whileElementsMounted);

	#x = $state(0);
	#y = $state(0);
	#placement: Placement = $state('bottom');
	#strategy: Strategy = $state('absolute');
	#middlewareData: MiddlewareData = $state.frozen({});
	#isPositioned = $state(false);
	#floatingStyles = $derived.by(() => {
		const initialStyles = {
			position: this.strategy,
			left: '0',
			top: '0'
		};

		const { floating } = this.#elements;
		if (floating == null) {
			return styleObjectToString(initialStyles);
		}

		const xVal = roundByDPR(floating, this.x);
		const yVal = roundByDPR(floating, this.y);

		if (this.#transform) {
			return styleObjectToString({
				...initialStyles,
				transform: `translate(${xVal}px, ${yVal}px)`,
				...(getDPR(floating) >= 1.5 && { willChange: 'transform' })
			});
		}

		return styleObjectToString({
			position: this.#strategyOption,
			left: `${xVal}px`,
			top: `${yVal}px`
		});
	});

	#update = () => {
		const { reference, floating } = this.#elements;
		if (reference == null || floating == null) {
			return;
		}

		computePosition(reference, floating, {
			middleware: this.#middleware,
			placement: this.#placementOption,
			strategy: this.#strategyOption
		}).then((position) => {
			this.#x = position.x;
			this.#y = position.y;
			this.#strategy = position.strategy;
			this.#placement = position.placement;
			this.#middlewareData = position.middlewareData;
			this.#isPositioned = true;
		});
	};

	#attach = () => {
		if (this.#whileElementsMounted === undefined) {
			this.update();
			return;
			1;
		}

		const { floating, reference } = this.#elements;
		if (reference != null && floating != null) {
			return this.#whileElementsMounted(reference, floating, this.update);
		}
	};

	#reset = () => {
		if (!this.#open) {
			this.#isPositioned = false;
		}
	};

	/**
	 * The x-coord of the floating element.
	 */
	get x(): number {
		return this.#x;
	}

	/**
	 * The y-coord of the floating element.
	 */
	get y(): number {
		return this.#y;
	}

	/**
	 * The stateful placement, which can be different from the initial `placement` passed as options.
	 */
	get placement(): Placement {
		return this.#placement;
	}

	/**
	 * The type of CSS position property to use.
	 */
	get strategy(): Strategy {
		return this.#strategy;
	}

	/**
	 * Additional data from middleware.
	 */
	get middlewareData(): MiddlewareData {
		return this.#middlewareData;
	}

	/**
	 * The boolean that let you know if the floating element has been positioned.
	 */
	get isPositioned(): boolean {
		return this.#isPositioned;
	}

	/**
	 * CSS styles to apply to the floating element to position it.
	 */
	get floatingStyles(): string {
		return this.#floatingStyles;
	}

	/**
	 * The function to update floating position manually.
	 */
	get update(): () => void {
		return this.#update;
	}

	/**
	 * The open state of the floating element.
	 */
	get open(): boolean {
		return this.#open;
	}

	/**
	 * The event handler is invoked whenever the open state changes.
	 */
	get onOpenChange(): (open: boolean, event?: Event, reason?: OpenChangeReason) => void {
		return this.#onOpenChange;
	}

	/**
	 * The reference and floating elements.
	 */
	get elements(): FloatingElements {
		return this.#elements;
	}
}

/**
 * Hook for managing floating elements.
 */
function useFloating(options: UseFloatingOptions = {}): UseFloating {
	return new UseFloating(options);
}
``;

export { useFloating, type UseFloating, type UseFloatingOptions };
