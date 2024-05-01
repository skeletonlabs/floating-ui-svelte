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

interface HandleCloseFn {
	(floating: Floating): (event: MouseEvent) => void;
	__options: {
		blockPointerEvents: boolean;
	};
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

	handleClose?: HandleCloseFn | null;
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
	readonly #handleClose = $derived.by(() => this.#options.handleClose ?? null);

	readonly #isHoverOpen = $derived.by(() => {
		return () => {
			const type = this.#floating.openEvent?.type;
			return type?.includes('mouse') && type !== 'mousedown';
		};
	});

	#timeout = -1;
	#restTimeout = 1;
	#blockMouse = true;

	constructor(floating: Floating, options: HoverOptions = {}) {
		this.#floating = floating;
		this.#options = options;

		$effect(() => {
			if (!this.#enabled) {
				return;
			}
			const onOpenChange = ({ open }: { open: boolean }) => {
				if (!open) {
					clearTimeout(this.#timeout);
					clearTimeout(this.#restTimeout);
					this.#blockMouse = true;
				}
			};

			// @ts-expect-error - FIXME
			this.#floating.events.on('openChange', onOpenChange);

			return () => {
				// @ts-expect-error - FIXME
				this.#floating.events.off('openChange', onOpenChange);
			};
		});

		$effect(() => {
			if (!this.#enabled || !this.#handleClose || !this.#floating.open) {
				return;
			}

			const onLeave = (event: MouseEvent) => {
				if (this.#isHoverOpen()) {
					this.#floating.onOpenChange(false, event, 'hover');
				}
			};

			document.addEventListener('mouseleave', onLeave);

			return () => {
				document.removeEventListener('mouseleave', onLeave);
			};
		});

		// TODO: Continue porting from here. See: https://github.com/floating-ui/floating-ui/blob/master/packages/react/src/hooks/useHover.ts#L177
	}

	get reference() {
		return {};
	}

	get floating() {
		return {};
	}
}

function useHover(floating: Floating, options: HoverOptions = {}): Hover {
	return new Hover(floating, options);
}

export { useHover, type HoverOptions, type Hover };
