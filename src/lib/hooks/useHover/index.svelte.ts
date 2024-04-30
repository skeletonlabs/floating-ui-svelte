import type { Floating } from '../useFloating/index.svelte.js';
import type { Interaction } from '../useInteractions/index.svelte.js';

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
	 * Time in ms that the pointer must rest on the reference element before the open state is set to true.
	 * @default 0
	 */
	restMs?: number;

	/**
	 * Whether moving the pointer over the floating element will open it, without a regular hover event required.
	 * @default true
	 */
	move?: boolean;
}

class Hover implements Interaction {
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
	readonly #move = $derived.by(() => this.#options.move ?? true);

	#openTimeout: ReturnType<typeof setTimeout> | null = null;
	#closeTimeout: ReturnType<typeof setTimeout> | null = null;
	#restTimeout: ReturnType<typeof setTimeout> | null = null;

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

	#clearTimeouts() {
		this.#clearOpenTimeout();
		this.#clearCloseTimeout();
		this.#clearRestTimeout();
	}

	constructor(floating: Floating, options: HoverOptions = {}) {
		this.#floating = floating;
		this.#options = options;

		$effect(() => {
			return () => {
				this.#clearTimeouts();
			};
		});
	}

	get reference() {
		const onpointerenter = (event: PointerEvent) => {
			if (!this.#enabled || (this.#mouseOnly && event.pointerType !== 'mouse')) {
				return;
			}
			this.#clearTimeouts();

			if (this.#openDelay > 0) {
				this.#openTimeout = setTimeout(() => {
					this.#floating.onOpenChange(true, event, 'hover');
					this.#clearOpenTimeout();
				}, this.#openDelay);
			} else if (this.#restMs === 0) {
				this.#floating.onOpenChange(true, event, 'hover');
			}
		};

		const onpointermove = (event: PointerEvent) => {
			if (!this.#enabled || !this.#move || (this.#mouseOnly && event.pointerType !== 'mouse')) {
				return;
			}

			this.#clearRestTimeout();

			this.#restTimeout = setTimeout(() => {
				this.#floating.onOpenChange(true, event, 'hover');
				this.#clearRestTimeout();
			}, this.#restMs);
		};

		const onpointerleave = (event: PointerEvent) => {
			if (!this.#enabled || (this.#mouseOnly && event.pointerType !== 'mouse')) {
				return;
			}
			this.#clearTimeouts();

			if (this.#closeDelay > 0) {
				this.#closeTimeout = setTimeout(() => {
					this.#floating.onOpenChange(false, event, 'hover');
				}, this.#closeDelay);
				this.#clearCloseTimeout();
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

	get floating() {
		return {};
	}
}

function useHover(floating: Floating, options: HoverOptions = {}): Hover {
	return new Hover(floating, options);
}

export { useHover, type HoverOptions, type Hover };
