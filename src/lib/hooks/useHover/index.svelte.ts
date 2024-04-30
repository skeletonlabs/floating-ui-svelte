import type { Floating } from '../useFloating/index.svelte.js';

interface DelayOptions {
	/**
	 * Time in ms that will delay the change of the open state to true.
	 * @default 0
	 */
	show?: number;

	/**
	 * Time in ms that will delay the change of the open state to false.
	 * @default 0
	 */
	hide?: number;
}

interface HoverOptions {
	/**
	 * Enables/disables the hook.
	 * @default true
	 */
	enabled?: boolean;

	/**
	 * Only allow pointers of type mouse to trigger the hover (thus excluding pens and touchscreens).
	 * @default false
	 */
	mouseOnly?: boolean;

	/**
	 * Time in ms that will delay the change of the open state.
	 * @default 0
	 */
	delay?: number | DelayOptions;

	/**
	 * Time in ms that will delay the change of the open state when the pointer leaves the reference element.
	 * @default 0
	 */
	restMs?: number;
}

class Hover {
	readonly #floating: Floating;
	readonly #options: HoverOptions;
	readonly #enabled = $derived.by(() => this.#options.enabled ?? true);
	readonly #mouseOnly = $derived.by(() => this.#options.mouseOnly ?? false);
	readonly #openDelay = $derived.by(() => {
		const delay = this.#options.delay;
		if (typeof delay === 'number') {
			return delay;
		}
		return delay?.show ?? 0;
	});
	readonly #closeDelay = $derived.by(() => {
		const delay = this.#options.delay;
		if (typeof delay === 'number') {
			return delay;
		}
		return delay?.hide ?? 0;
	});
	readonly #restMs = $derived.by(() => this.#options.restMs ?? 0);

	#openTimeout: ReturnType<typeof setTimeout> | null;
	#closeTimeout: ReturnType<typeof setTimeout> | null;
	#restTimeout: ReturnType<typeof setTimeout> | null;

	#clearOpenTimeout() {
		if (this.#openTimeout !== null) {
			clearTimeout(this.#openTimeout);
			this.#openTimeout = null;
		}
	}

	#clearCloseTimeout() {
		if (this.#closeTimeout !== null) {
			clearTimeout(this.#closeTimeout);
			this.#closeTimeout = null;
		}
	}

	#clearRestTimeout() {
		if (this.#restTimeout !== null) {
			clearTimeout(this.#restTimeout);
			this.#restTimeout = null;
		}
	}

	constructor(floating: Floating, options: HoverOptions = {}) {
		this.#floating = floating;
		this.#options = options;
		this.#openTimeout = null;
		this.#closeTimeout = null;
		this.#restTimeout = null;

		$effect(() => () => {
			this.#clearOpenTimeout();
			this.#clearCloseTimeout();
			this.#clearRestTimeout();
		});
	}

	get referenceProps() {
		const onpointerenter = (event: PointerEvent) => {
			if (!this.#enabled || (this.#mouseOnly && event.pointerType !== 'mouse')) {
				return;
			}
			this.#clearOpenTimeout();
			this.#clearCloseTimeout();
			this.#clearRestTimeout();
			if (this.#openDelay > 0) {
				this.#openTimeout = setTimeout(() => {
					this.#floating.onOpenChange(true, event, 'hover');
				}, this.#openDelay);
			} else if (this.#restMs === 0) {
				this.#floating.onOpenChange(true, event, 'hover');
			}
		};

		const onpointermove = (event: PointerEvent) => {
			if (
				!this.#enabled ||
				this.#restMs === 0 ||
				(this.#mouseOnly && event.pointerType !== 'mouse')
			) {
				return;
			}
			this.#clearRestTimeout();
			this.#restTimeout = setTimeout(() => {
				this.#floating.onOpenChange(true, event, 'hover');
			}, this.#restMs);
		};

		const onpointerleave = (event: PointerEvent) => {
			if (!this.#enabled || (this.#mouseOnly && event.pointerType !== 'mouse')) {
				return;
			}
			this.#clearOpenTimeout();
			this.#clearCloseTimeout();
			this.#clearRestTimeout();

			if (this.#closeDelay > 0) {
				this.#closeTimeout = setTimeout(() => {
					this.#floating.onOpenChange(false, event, 'hover');
				}, this.#closeDelay);
			} else {
				this.#floating.onOpenChange(false, event, 'hover');
			}
		};

		return {
			onpointerenter,
			onpointermove,
			onpointerleave
		};
	}

	get floatingProps() {
		return {};
	}
}

function useHover(floating: Floating, options: HoverOptions = {}): Hover {
	return new Hover(floating, options);
}

export { useHover, type HoverOptions, type Hover };
