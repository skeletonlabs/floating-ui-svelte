import { isElement } from "@floating-ui/utils/dom";
import {
	contains,
	createAttribute,
	getDocument,
	isMouseLikePointerType,
	isPointerType,
	type PointerType,
} from "../internal/dom.js";
import { noop } from "../internal/noop.js";
import type {
	FloatingTreeType,
	MaybeGetter,
	OpenChangeReason,
} from "../types.js";
import type {
	FloatingContext,
	FloatingContextData,
} from "./use-floating.svelte.js";
import {
	useFloatingParentNodeId,
	useFloatingTree,
} from "../components/floating-tree/hooks.svelte.js";
import { on } from "svelte/events";
import { executeCallbacks } from "../internal/execute-callbacks.js";
import { snapshotFloatingContext } from "../internal/snapshot.svelte.js";
import { watch } from "../internal/watch.svelte.js";
import type { ElementProps } from "./use-interactions.svelte.js";
import { extract } from "../internal/extract.js";

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
	(
		context: FloatingContextData & {
			onClose: () => void;
			tree?: FloatingTreeType | null;
			leave?: boolean;
		},
	): (event: MouseEvent) => void;
	__options: {
		blockPointerEvents: boolean;
	};
}

interface UseHoverOptions {
	/**
	 * Enables/disables the hook.
	 * @default true
	 */
	enabled?: MaybeGetter<boolean>;

	/**
	 * Only allow pointers of type mouse to trigger the hover (thus excluding pens and touchscreens).
	 * @default false
	 */
	mouseOnly?: MaybeGetter<boolean>;

	/**
	 * Time in ms that will delay the change of the open state.
	 * @default 0
	 */
	delay?: MaybeGetter<number | DelayOptions>;

	/**
	 * Time in ms that the pointer must rest on the reference element before the open state is set to true.
	 * @default 0
	 */
	restMs?: MaybeGetter<number>;

	/**
	 * Whether moving the pointer over the floating element will open it, without a regular hover event required.
	 * @default true
	 */
	move?: MaybeGetter<boolean>;

	/**
	 * Callback to handle the closing of the floating element.
	 * @default null
	 */
	handleClose?: HandleCloseFn | null;
}

const safePolygonIdentifier = createAttribute("safe-polygon");

function getDelay(
	value: number | DelayOptions,
	prop: "open" | "close",
	pointerType?: PointerType,
) {
	if (pointerType && !isMouseLikePointerType(pointerType)) {
		return 0;
	}

	if (typeof value === "number") {
		return value;
	}

	return value?.[prop];
}

class HoverInteraction implements ElementProps {
	#enabled = $derived.by(() => extract(this.options.enabled ?? true));
	#mouseOnly = $derived.by(() => extract(this.options.mouseOnly ?? false));
	#delay = $derived.by(() => extract(this.options.delay ?? 0));
	#restMs = $derived.by(() => extract(this.options.restMs ?? 0));
	#move = $derived.by(() => extract(this.options.move ?? true));
	#handleClose = $state<HandleCloseFn | undefined | null>(null);
	#tree: FloatingTreeType | null = null;
	#parentId: string | null = null;
	#pointerType: PointerType | undefined = undefined;
	#timeout = -1;
	#handler: ((event: MouseEvent) => void) | undefined = undefined;
	#restTimeout = -1;
	#blockMouseMove = true;
	#performedPointerEventsMutation = false;
	#unbindMouseMove = noop;
	#restTimeoutPending = false;
	#isHoverOpen = $derived.by(() => {
		const type = this.context.data.openEvent?.type;
		return type?.includes("mouse") && type !== "mousedown";
	});
	#isClickLikeOpenEvent = $derived.by(() => {
		return this.context.data.openEvent
			? ["click", "mousedown"].includes(this.context.data.openEvent.type)
			: false;
	});

	constructor(
		private readonly context: FloatingContext,
		private readonly options: UseHoverOptions = {},
	) {
		this.#handleClose = options.handleClose;

		$effect.pre(() => {
			this.#handleClose = options.handleClose;
		});

		this.#tree = useFloatingTree();
		this.#parentId = useFloatingParentNodeId();

		watch(
			[() => this.#enabled, () => this.context.events],
			([enabled, events]) => {
				if (!enabled) return;

				const onOpenChange = ({ open }: { open: boolean }) => {
					if (!open) {
						window.clearTimeout(this.#timeout);
						window.clearTimeout(this.#restTimeout);
						this.#blockMouseMove = true;
						this.#restTimeoutPending = false;
					}
				};

				events.on("openchange", onOpenChange);

				return () => {
					events.off("openchange", onOpenChange);
				};
			},
		);

		watch(
			[
				() => this.#enabled,
				() => this.#handleClose,
				() => this.context.open,
				() => this.context.floating,
				() => this.#isHoverOpen,
			],
			([enabled, handleClose, open, floating]) => {
				if (!enabled || !handleClose || !open) return;

				const onLeave = (event: MouseEvent) => {
					if (!this.#isHoverOpen) return;
					this.context.onOpenChange(false, event, "hover");
				};

				const html = getDocument(floating).documentElement;
				return on(html, "mouseleave", onLeave);
			},
		);

		// Registering the mouse events on the reference directly to bypass Svelte's
		// delegation system. If the cursor was on a disabled element and then entered
		// the reference (no gap), `mouseenter` doesn't fire in the delegation system.
		$effect(() => {
			if (!this.#enabled) return;

			const onMouseEnter = (event: MouseEvent) => {
				window.clearTimeout(this.#timeout);
				this.#blockMouseMove = false;

				if (
					(this.#mouseOnly && !isMouseLikePointerType(this.#pointerType)) ||
					(this.#restMs > 0 && !getDelay(this.#delay, "open"))
				) {
					return;
				}

				const openDelay = getDelay(this.#delay, "open", this.#pointerType);

				if (openDelay) {
					this.#timeout = window.setTimeout(() => {
						if (!context.open) {
							context.onOpenChange(true, event, "hover");
						}
					}, openDelay);
				} else if (!context.open) {
					context.onOpenChange(true, event, "hover");
				}
			};

			const onMouseLeave = (event: MouseEvent) => {
				if (this.#isClickLikeOpenEvent) return;

				this.#unbindMouseMove();

				const doc = getDocument(context.floating);
				window.clearTimeout(this.#restTimeout);
				this.#restTimeoutPending = false;

				if (this.#handleClose && context.data.floatingContext) {
					// Prevent clearing `onScrollMouseLeave` timeout.
					if (!context.open) {
						window.clearTimeout(this.#timeout);
					}

					this.#handler = this.#handleClose({
						...snapshotFloatingContext(context).current,
						tree: this.#tree,
						x: event.clientX,
						y: event.clientY,
						onClose: () => {
							this.#clearPointerEvents();
							this.#cleanupMouseMoveHandler();
							if (!this.#isClickLikeOpenEvent) {
								this.#closeWithDelay(event, true, "safe-polygon");
							}
						},
					});

					const handler = this.#handler;

					doc.addEventListener("mousemove", handler);
					this.#unbindMouseMove = () => {
						doc.removeEventListener("mousemove", handler);
					};

					return;
				}

				// Allow interactivity without `safePolygon` on touch devices. With a
				// pointer, a short close delay is an alternative, so it should work
				// consistently.
				const shouldClose =
					this.#pointerType === "touch"
						? !contains(context.floating, event.relatedTarget as Element | null)
						: true;
				if (shouldClose) {
					this.#closeWithDelay(event);
				}
			};

			// Ensure the floating element closes after scrolling even if the pointer
			// did not move.
			// https://github.com/floating-ui/floating-ui/discussions/1692
			const onScrollMouseLeave = (event: MouseEvent) => {
				if (this.#isClickLikeOpenEvent) return;
				if (!context.data.floatingContext) return;

				this.#handleClose?.({
					...snapshotFloatingContext(context.data.floatingContext).current,
					tree: this.#tree,
					x: event.clientX,
					y: event.clientY,
					onClose: () => {
						this.#clearPointerEvents();
						this.#cleanupMouseMoveHandler();
						if (!this.#isClickLikeOpenEvent) {
							this.#closeWithDelay(event);
						}
					},
				})(event);
			};

			if (isElement(context.domReference)) {
				const ref = context.domReference as unknown as HTMLElement;
				context.open && ref.addEventListener("mouseleave", onScrollMouseLeave);
				context.floating?.addEventListener("mouseleave", onScrollMouseLeave);
				this.#move &&
					ref.addEventListener("mousemove", onMouseEnter, { once: true });
				ref.addEventListener("mouseenter", onMouseEnter);
				ref.addEventListener("mouseleave", onMouseLeave);
				return () => {
					context.open &&
						ref.removeEventListener("mouseleave", onScrollMouseLeave);
					context.floating?.removeEventListener(
						"mouseleave",
						onScrollMouseLeave,
					);
					this.#move && ref.removeEventListener("mousemove", onMouseEnter);
					ref.removeEventListener("mouseenter", onMouseEnter);
					ref.removeEventListener("mouseleave", onMouseLeave);
				};
			}
		});

		// Block pointer-events of every element other than the reference and floating
		// while the floating element is open and has a `handleClose` handler. Also
		// handles nested floating elements.
		// https://github.com/floating-ui/floating-ui/issues/1722
		watch(
			[
				() => this.#enabled,
				() => this.context.open,
				() => this.context.floating,
				() => this.context.domReference,
				() => this.#handleClose,
				() => this.#isHoverOpen,
			],
			([enabled, open, floating, domReference, handleClose, treeNodes]) => {
				if (!enabled) return;
				if (
					open &&
					handleClose?.__options.blockPointerEvents &&
					this.#isHoverOpen
				) {
					this.#performedPointerEventsMutation = true;
					const floatingEl = floating;
					if (!isElement(domReference) || !floatingEl) return;

					const body = getDocument(floating).body;
					body.setAttribute(safePolygonIdentifier, "");

					const ref = domReference as unknown as HTMLElement | SVGSVGElement;

					const parentFloating = this.#tree?.nodes.find(
						(node) => node.id === this.#parentId,
					)?.context?.floating;

					if (parentFloating) {
						parentFloating.style.pointerEvents = "";
					}

					body.style.pointerEvents = "none";
					ref.style.pointerEvents = "auto";
					floatingEl.style.pointerEvents = "auto";

					return () => {
						body.style.pointerEvents = "";
						ref.style.pointerEvents = "";
						floatingEl.style.pointerEvents = "";
					};
				}
			},
		);

		$effect(() => {
			if (!this.context.open) {
				this.#pointerType = undefined;
				this.#restTimeoutPending = false;
				this.#cleanupMouseMoveHandler();
				this.#clearPointerEvents();
			}
		});

		watch([() => this.#enabled, () => this.context.domReference], () => {
			return () => {
				this.#cleanupMouseMoveHandler();
				window.clearTimeout(this.#timeout);
				window.clearTimeout(this.#restTimeout);
				this.#clearPointerEvents();
			};
		});
	}

	#closeWithDelay = (
		event: Event,
		runElseBranch = true,
		reason: OpenChangeReason = "hover",
	) => {
		const closeDelay = getDelay(this.#delay, "close", this.#pointerType);
		if (closeDelay && !this.#handler) {
			window.clearTimeout(this.#timeout);
			this.#timeout = window.setTimeout(
				() => this.context.onOpenChange(false, event, reason),
				closeDelay,
			);
		} else if (runElseBranch) {
			window.clearTimeout(this.#timeout);
			this.context.onOpenChange(false, event, reason);
		}
	};

	#cleanupMouseMoveHandler = () => {
		this.#unbindMouseMove();
		this.#handler = undefined;
	};

	#clearPointerEvents = () => {
		if (!this.#performedPointerEventsMutation) return;

		const body = getDocument(this.context.floating).body;
		body.style.pointerEvents = "";
		body.removeAttribute(safePolygonIdentifier);
		this.#performedPointerEventsMutation = false;
	};

	#setPointerType = (event: PointerEvent) => {
		if (!isPointerType(event.pointerType)) return;
		this.#pointerType = event.pointerType;
	};

	#onReferenceMouseMove = (event: MouseEvent) => {
		const handleMouseMove = () => {
			if (!this.#blockMouseMove && !this.context.open) {
				this.context.onOpenChange(true, event, "hover");
			}
		};

		if (this.#mouseOnly && !isMouseLikePointerType(this.#pointerType)) return;
		if (this.context.open || this.#restMs === 0) return;

		// ignore insignificant movements to account for tremors
		if (
			this.#restTimeoutPending &&
			event.movementX ** 2 + event.movementY ** 2 < 2
		) {
			return;
		}

		window.clearTimeout(this.#restTimeout);

		if (this.#pointerType === "touch") {
			handleMouseMove();
		} else {
			this.#restTimeoutPending = true;
			this.#restTimeout = window.setTimeout(handleMouseMove, this.#restMs);
		}
	};

	#onFloatingMouseEnter = () => {
		window.clearTimeout(this.#timeout);
	};

	#onFloatingMouseLeave = (event: MouseEvent) => {
		if (this.#isClickLikeOpenEvent) return;
		this.#closeWithDelay(event, false);
	};

	#reference = $derived.by(() => {
		if (!this.#enabled) return {};
		return {
			onpointerdown: this.#setPointerType,
			onpointerenter: this.#setPointerType,
			onmousemove: this.#onReferenceMouseMove,
		};
	});

	#floating = $derived.by(() => {
		if (!this.#enabled) return {};
		return {
			onmouseenter: this.#onFloatingMouseEnter,
			onmouseleave: this.#onFloatingMouseLeave,
		};
	});

	get reference() {
		return this.#reference;
	}

	get floating() {
		return this.#floating;
	}
}

function useHover(context: FloatingContext, options: UseHoverOptions = {}) {
	return new HoverInteraction(context, options);
}

export type { UseHoverOptions, HandleCloseFn };
export { useHover, HoverInteraction };
