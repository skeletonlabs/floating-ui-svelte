import type { OpenChangeReason } from '$lib/types.js';
import { createAttribute, isMouseLikePointerType, noop } from '$lib/utils.js';
import type { Floating } from '../useFloating/index.svelte.js';
import type { Interaction } from '../useInteractions/index.svelte.js';

const safePolygonIdentifier = createAttribute('safe-polygon');

export function getDelay(
	value: HoverOptions['delay'],
	prop: 'open' | 'close',
	pointerType?: PointerEvent['pointerType']
) {
	if (pointerType && !isMouseLikePointerType(pointerType)) {
		return 0;
	}

	if (typeof value === 'number') {
		return value;
	}

	return value?.[prop];
}

interface DelayOptions {
	/**
	 * Time in ms that will delay the change of the open state to true.
	 * @default 0
	 */
	open?: number;

	/**
	 * Time in ms that will delay the change of the open state to false.
	 * @default 0
	 */
	close?: number;
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

	/**
	 * Callback to handle the closing of the floating element.
	 */
	handleClose?: HandleCloseFn | null;
}

class Hover implements Interaction {
	readonly #floating: Floating;
	readonly #options: HoverOptions;
	readonly #enabled = $derived.by(() => this.#options.enabled ?? true);
	readonly #delay = $derived.by(() => this.#options.delay ?? 0);
	readonly #mouseOnly = $derived.by(() => this.#options.mouseOnly ?? false);
	readonly #restMs = $derived.by(() => this.#options.restMs ?? 0);
	readonly #move = $derived.by(() => this.#options.move ?? true);
	readonly #handleClose = $derived.by(() => this.#options.handleClose ?? null);

	readonly #isHoverOpen = $derived.by(() => {
		return () => {
			const type = this.#floating.openEvent?.type;
			return type?.includes('mouse') && type !== 'mousedown';
		};
	});

	#pointerType: string | undefined = undefined;
	#handler: ((event: MouseEvent) => void) | undefined = undefined;
	#timeout = 0;
	#restTimeout = 1;
	#blockMouse = true;
	#performedPointerEventsMutation = false;
	#unbindMouseMove = noop;

	#clearPointerEvents() {
		if (!this.#performedPointerEventsMutation) {
			return;
		}
		document.body.style.pointerEvents = '';
		document.body.removeAttribute(safePolygonIdentifier);
		this.#performedPointerEventsMutation = false;
	}

	#closeWithDelay(event: Event, runElseBranch = true, reason: OpenChangeReason = 'hover') {
		const closeDelay = getDelay(this.#delay, 'close', this.#pointerType);
		if (closeDelay && !this.#handler) {
			clearTimeout(this.#restTimeout);
			this.#timeout = window.setTimeout(
				() => this.#floating.onOpenChange(false, event, reason),
				closeDelay
			);
		} else if (runElseBranch) {
			clearTimeout(this.#timeout);
			this.#floating.onOpenChange(false, event, reason);
		}
	}

	#cleanupMouseMoveHandler() {
		this.#unbindMouseMove();
		this.#handler = undefined;
	}

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

		$effect(() => {
			if (!this.#enabled) {
				return;
			}
			const isClickLikeOpenEvent = () => {
				if (!this.#floating.openEvent) {
					return false;
				}
				return ['click', 'mousedown'].includes(this.#floating.openEvent.type);
			};

			const onMouseEnter = () => {
				clearTimeout(this.#timeout);
				this.#blockMouse = false;

				if (
					(this.#mouseOnly && !isMouseLikePointerType(this.#pointerType)) ||
					(this.#restMs > 0 && !getDelay(this.#delay, 'open'))
				) {
					return;
				}

				const openDelay = getDelay(this.#delay, 'open', this.#pointerType);

				if (openDelay) {
					this.#timeout = window.setTimeout(() => {
						this.#floating.onOpenChange(true, event, 'hover');
					}, openDelay);
				} else {
					this.#floating.onOpenChange(true, event, 'hover');
				}
			};

			// TODO: Continue from here - https://github.com/floating-ui/floating-ui/blob/master/packages/react/src/hooks/useHover.ts#L257
		});
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
