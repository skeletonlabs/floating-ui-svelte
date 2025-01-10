import { isElement } from "@floating-ui/utils/dom";
import {
	contains,
	createAttribute,
	getDocument,
	isMouseLikePointerType,
} from "../internal/dom.js";
import { noop } from "../internal/noop.js";
import type { FloatingTreeType, OpenChangeReason } from "../types.js";
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
	 * @default null
	 */
	handleClose?: HandleCloseFn | null;
}

const safePolygonIdentifier = createAttribute("safe-polygon");

function getDelay(
	value: UseHoverOptions["delay"],
	prop: "open" | "close",
	pointerType?: PointerEvent["pointerType"],
) {
	if (pointerType && !isMouseLikePointerType(pointerType)) {
		return 0;
	}

	if (typeof value === "number") {
		return value;
	}

	return value?.[prop];
}

class HoverInteraction {
	#enabled = $derived.by(() => this.options.enabled ?? true);
	#mouseOnly = $derived.by(() => this.options.mouseOnly ?? false);
	#delay = $derived.by(() => this.options.delay ?? 0);
	#restMs = $derived.by(() => this.options.restMs ?? 0);
	#move = $derived.by(() => this.options.move ?? true);
	#handleClose = $derived.by(() => this.options.handleClose ?? null);
	#tree: FloatingTreeType | null = null;
	#parentId: string | null = null;
	#pointerType: string | undefined = undefined;
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
		this.#tree = useFloatingTree();
		this.#parentId = useFloatingParentNodeId();

		$effect(() => {
			if (!this.#enabled) return;

			const onOpenChange = ({ open }: { open: boolean }) => {
				if (open) return;
				window.clearTimeout(this.#timeout);
				window.clearTimeout(this.#restTimeout);
				this.#blockMouseMove = true;
				this.#restTimeoutPending = true;
			};

			this.context.events.on("openchange", onOpenChange);

			return () => {
				this.context.events.off("openchange", onOpenChange);
			};
		});

		$effect(() => {
			if (!this.#enabled || !this.#handleClose || !this.context.open) return;

			const onLeave = (event: MouseEvent) => {
				if (!this.#isHoverOpen) return;
				this.context.onOpenChange(false, event, "hover");
			};

			const html = getDocument(this.context.elements.floating).documentElement;

			return on(html, "mouseleave", onLeave);
		});

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
						if (!this.context.open) {
							this.context.onOpenChange(true, event, "hover");
						}
					}, openDelay);
				} else if (!this.context.open) {
					this.context.onOpenChange(true, event, "hover");
				}
			};

			const onMouseLeave = (event: MouseEvent) => {
				if (this.#isClickLikeOpenEvent) return;

				this.#unbindMouseMove();
				const doc = getDocument(this.context.elements.floating);
				window.clearTimeout(this.#restTimeout);
				this.#restTimeoutPending = false;

				if (this.#handleClose && this.context.data.floatingContext) {
					// prevent clearing `onScrollMouseLeave` timeout
					if (!this.context.open) {
						window.clearTimeout(this.#timeout);
					}

					this.#handler = this.#handleClose({
						...snapshotFloatingContext(this.context).current,
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

					const removeListener = on(doc, "mousemove", handler);

					this.#unbindMouseMove = () => {
						removeListener();
					};

					return;
				}
				// Allow interactivity without `safePolygon` on touch devices. With a
				// pointer, a short close delay is an alternative, so it should work
				// consistently.
				const shouldClose =
					this.#pointerType === "touch"
						? !contains(
								this.context.elements.floating,
								event.relatedTarget as Element | null,
							)
						: true;
				if (shouldClose) {
					this.#closeWithDelay(event);
				}
			};

			// Ensure the floating element closes after scrolling even if the pointer
			// did not move.
			// https://github.com/floating-ui/floating-ui/discussions/1692
			const onScrollMouseLeave = (event: MouseEvent) => {
				if (!this.#isClickLikeOpenEvent || !this.context.data.floatingContext) {
					return;
				}

				this.#handleClose?.({
					...snapshotFloatingContext(this.context).current,
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

			if (isElement(this.context.elements.domReference)) {
				const domRef = this.context.elements.domReference as HTMLElement;
				const listenersToRemove: Array<() => void> = [];
				if (this.context.open) {
					listenersToRemove.push(on(domRef, "mouseleave", onScrollMouseLeave));
				}
				if (this.context.elements.floating) {
					listenersToRemove.push(
						on(
							this.context.elements.floating,
							"mouseleave",
							onScrollMouseLeave,
						),
					);
				}
				if (this.#move) {
					listenersToRemove.push(
						on(domRef, "mousemove", onMouseEnter, { once: true }),
					);
				}
				listenersToRemove.push(
					on(domRef, "mouseenter", onMouseEnter),
					on(domRef, "mouseleave", onMouseLeave),
				);

				return () => {
					executeCallbacks(...listenersToRemove);
				};
			}
		});

		// Block pointer-events of every element other than the reference and floating
		// while the floating element is open and has a `handleClose` handler. Also
		// handles nested floating elements.
		// https://github.com/floating-ui/floating-ui/issues/1722

		$effect(() => {
			if (!this.#enabled) return;

			if (
				this.context.open &&
				this.#handleClose?.__options.blockPointerEvents &&
				this.#isHoverOpen
			) {
				this.#performedPointerEventsMutation = true;
				const floatingEl = this.context.elements.floating;
				if (isElement(this.context.elements.domReference) && floatingEl) {
					const body = getDocument(floatingEl).body;
					body.setAttribute(safePolygonIdentifier, "");

					const ref = this.context.elements.domReference as unknown as
						| HTMLElement
						| SVGSVGElement;

					const parentFloating = this.#tree?.nodes.find(
						(node) => node.id === this.#parentId,
					)?.context?.elements.floating;

					if (parentFloating) {
						parentFloating.style.pointerEvents = "";
					}

					body.style.pointerEvents = "none";
					ref.style.pointerEvents = "";
					floatingEl.style.pointerEvents = "";
					return () => {
						body.style.pointerEvents = "";
						ref.style.pointerEvents = "";
						floatingEl.style.pointerEvents = "";
					};
				}
			}
		});

		$effect(() => {
			if (!this.context.open) {
				this.#pointerType = undefined;
				this.#restTimeoutPending = false;
				this.#cleanupMouseMoveHandler();
				this.#clearPointerEvents();
			}
		});

		$effect(() => {
			[this.#enabled, this.context.elements.domReference];
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

		const body = getDocument(this.context.elements.floating).body;
		body.style.pointerEvents = "";
		body.removeAttribute(safePolygonIdentifier);
		this.#performedPointerEventsMutation = false;
	};

	#setPointerType = (event: PointerEvent) => {
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

	reference = $derived.by(() => {
		if (!this.#enabled) return {};
		return {
			onpointerdown: this.#setPointerType,
			onpointerenter: this.#setPointerType,
			onmousemove: this.#onReferenceMouseMove,
		};
	});

	floating = $derived.by(() => {
		if (!this.#enabled) return {};
		return {
			onmouseenter: this.#onFloatingMouseEnter,
			onmouseleave: this.#onFloatingMouseLeave,
		};
	});

	get enabled() {
		return this.#enabled;
	}
}

function useHover(context: FloatingContext, options: UseHoverOptions = {}) {
	return new HoverInteraction(context, options);
}

export type { UseHoverOptions };
export { useHover, HoverInteraction };
