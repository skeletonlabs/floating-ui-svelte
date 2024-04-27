import type { FloatingElements, OpenChangeReason, UseFloatingOptions } from '$lib/types.js';
import { getDPR, noop, roundByDPR, styleObjectToString } from '$lib/utils.js';
import type { Strategy } from '@floating-ui/dom';
import type { Placement } from '@floating-ui/dom';
import type { MiddlewareData, ReferenceElement } from '@floating-ui/dom';
import { computePosition } from '@floating-ui/dom';

class FloatingState<T extends ReferenceElement = ReferenceElement> {
	readonly #options: UseFloatingOptions<T>;

	constructor(options: UseFloatingOptions<T>) {
		this.#options = options;
		this.placement = this.placementOption;
		this.strategy = this.strategyOption;
	}

	open = $derived.by(() => this.#options.open ?? true);
	onOpenChange = $derived.by(() => this.#options.onOpenChange ?? noop);
	placementOption = $derived.by(() => this.#options.placement ?? 'bottom');
	strategyOption = $derived.by(() => this.#options.strategy ?? 'absolute');
	middleware = $derived.by(() => this.#options.middleware);
	transform = $derived.by(() => this.#options.transform ?? true);
	elements = $derived.by(() => this.#options.elements ?? {});
	whileElementsMounted = $derived.by(() => this.#options.whileElementsMounted);

	x = $state(0);
	y = $state(0);
	placement: Placement = $state('bottom');
	strategy: Strategy = $state('absolute');
	middlewareData: MiddlewareData = $state.frozen({});
	isPositioned = $state(false);
	floatingStyles = $derived.by(() => {
		const initialStyles = {
			position: this.strategy,
			left: '0',
			top: '0'
		};

		const { floating } = this.elements;
		if (floating == null) {
			return styleObjectToString(initialStyles);
		}

		const xVal = roundByDPR(floating, this.x);
		const yVal = roundByDPR(floating, this.y);

		if (this.transform) {
			return styleObjectToString({
				...initialStyles,
				transform: `translate(${xVal}px, ${yVal}px)`,
				...(getDPR(floating) >= 1.5 && { willChange: 'transform' })
			});
		}

		return styleObjectToString({
			position: this.strategyOption,
			left: `${xVal}px`,
			top: `${yVal}px`
		});
	});
}

export class FloatingContext<T extends ReferenceElement = ReferenceElement> {
	readonly #state: FloatingState<T>;

	constructor(state: FloatingState<T>) {
		this.#state = state;
	}

	/**
	 * Represents the open/close state of the floating element.
	 * @default true
	 */
	get open(): boolean {
		return this.#state.open;
	}

	/**
	 * Event handler that can be invoked whenever the open state changes.
	 */
	get onOpenChange(): (open: boolean, event?: Event, reason?: OpenChangeReason) => void {
		return this.#state.onOpenChange;
	}

	/**
	 * The reference and floating elements.
	 */
	get elements(): FloatingElements<T> {
		return this.#state.elements;
	}
}

export class UseFloatingReturn<T extends ReferenceElement = ReferenceElement> {
	readonly #state: FloatingState<T>;
	readonly #context: FloatingContext<T>;
	readonly #update: () => void;

	constructor(state: FloatingState<T>, update: () => void) {
		this.#state = state;
		this.#context = new FloatingContext(state);
		this.#update = update;
	}

	/**
	 * The x-coord of the floating element.
	 */
	get x(): number {
		return this.#state.x;
	}

	/**
	 * The y-coord of the floating element.
	 */
	get y(): number {
		return this.#state.y;
	}

	/**
	 * The stateful placement, which can be different from the initial `placement` passed as options.
	 */
	get placement(): Placement {
		return this.#state.placement;
	}

	/**
	 * The type of CSS position property to use.
	 */
	get strategy(): Strategy {
		return this.#state.strategy;
	}

	/**
	 * Additional data from middleware.
	 */
	get middlewareData(): MiddlewareData {
		return this.#state.middlewareData;
	}

	/**
	 * The boolean that let you know if the floating element has been positioned.
	 */
	get isPositioned(): boolean {
		return this.#state.isPositioned;
	}

	/**
	 * CSS styles to apply to the floating element to position it.
	 */
	get floatingStyles(): string {
		return this.#state.floatingStyles;
	}

	/**
	 * The function to update floating position manually.
	 */
	get update(): () => void {
		return this.#update;
	}

	/**
	 * Context object containing internal logic to alter the behavior of the floating element.
	 * Commonly used to inject into others hooks.
	 */
	get context(): FloatingContext<T> {
		return this.#context;
	}
}

/**
 * Hook for managing floating elements.
 * Aims to keep as much parity with `@floating-ui/react` as possible.
 * For now see: https://floating-ui.com/docs/useFloating for API documentation.
 */
export function useFloating<T extends ReferenceElement = ReferenceElement>(
	options: UseFloatingOptions<T> = {}
): UseFloatingReturn<T> {
	const state = new FloatingState(options);

	function update() {
		const { reference, floating } = state.elements;
		if (reference == null || floating == null) {
			return;
		}

		computePosition(reference, floating, {
			middleware: state.middleware,
			placement: state.placementOption,
			strategy: state.strategyOption
		}).then((position) => {
			state.x = position.x;
			state.y = position.y;
			state.strategy = position.strategy;
			state.placement = position.placement;
			state.middlewareData = position.middlewareData;
			state.isPositioned = true;
		});
	}

	function attach() {
		if (state.whileElementsMounted === undefined) {
			update();
			return;
		}

		const { floating, reference } = state.elements;
		if (reference != null && floating != null) {
			return state.whileElementsMounted(reference, floating, update);
		}
	}

	function reset() {
		if (!state.open) {
			state.isPositioned = false;
		}
	}

	$effect.pre(update);
	$effect.pre(attach);
	$effect.pre(reset);

	return new UseFloatingReturn(state, update);
}
