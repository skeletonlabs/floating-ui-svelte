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
import { snapshotFloatingContext } from "../internal/snapshot.svelte.js";
import { watch } from "../internal/watch.svelte.js";
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

function useHover(context: FloatingContext, options: UseHoverOptions = {}) {
	const enabled = $derived(extract(options.enabled, true));
	const mouseOnly = $derived(extract(options.mouseOnly, false));
	const delay = $derived(extract(options.delay, 0));
	const restMs = $derived(extract(options.restMs, 0));
	const move = $derived(extract(options.move, true));
	const handleClose: HandleCloseFn | null = options.handleClose ?? null;
	const tree = useFloatingTree();
	const parentId = useFloatingParentNodeId();

	let pointerType: PointerType | undefined = undefined;
	let timeout = -1;
	let handler: ((event: MouseEvent) => void) | undefined = undefined;
	let restTimeout = -1;
	let blockMouseMove = true;
	let performedPointerEventsMutation = false;
	let unbindMouseMove = noop;
	let restTimeoutPending = false;
	const isHoverOpen = $derived.by(() => {
		const type = context.data.openEvent?.type;
		return type?.includes("mouse") && type !== "mousedown";
	});
	const isClickLikeOpenEvent = $derived.by(() => {
		return context.data.openEvent
			? ["click", "mousedown"].includes(context.data.openEvent.type)
			: false;
	});

	function closeWithDelay(
		event: Event,
		runElseBranch = true,
		reason: OpenChangeReason = "hover",
	) {
		const closeDelay = getDelay(delay, "close", pointerType);
		if (closeDelay && !handler) {
			window.clearTimeout(timeout);
			timeout = window.setTimeout(
				() => context.onOpenChange(false, event, reason),
				closeDelay,
			);
		} else if (runElseBranch) {
			window.clearTimeout(timeout);
			context.onOpenChange(false, event, reason);
		}
	}

	function cleanupMouseMoveHandler() {
		unbindMouseMove();
		handler = undefined;
	}

	function clearPointerEvents() {
		if (!performedPointerEventsMutation) return;

		const body = getDocument(context.floating).body;
		body.style.pointerEvents = "";
		body.removeAttribute(safePolygonIdentifier);
		performedPointerEventsMutation = false;
	}

	function setPointerType(event: PointerEvent) {
		if (!isPointerType(event.pointerType)) return;
		pointerType = event.pointerType;
	}

	function onReferenceMouseMove(event: MouseEvent) {
		const handleMouseMove = () => {
			if (!blockMouseMove && !context.open) {
				context.onOpenChange(true, event, "hover");
			}
		};

		if (mouseOnly && !isMouseLikePointerType(pointerType)) return;
		if (context.open || restMs === 0) return;

		// ignore insignificant movements to account for tremors
		if (restTimeoutPending && event.movementX ** 2 + event.movementY ** 2 < 2) {
			return;
		}

		window.clearTimeout(restTimeout);

		if (pointerType === "touch") {
			handleMouseMove();
		} else {
			restTimeoutPending = true;
			restTimeout = window.setTimeout(handleMouseMove, restMs);
		}
	}

	function onFloatingMouseEnter() {
		window.clearTimeout(timeout);
	}

	function onFloatingMouseLeave(event: MouseEvent) {
		if (isClickLikeOpenEvent) return;
		closeWithDelay(event, false);
	}

	// When closing before opening, clear the delay timeouts to cancel it
	// from showing.
	watch([() => enabled, () => context.events], () => {
		if (!enabled) return;

		const onOpenChange = ({ open }: { open: boolean }) => {
			if (!open) {
				window.clearTimeout(timeout);
				window.clearTimeout(restTimeout);
				blockMouseMove = true;
				restTimeoutPending = false;
			}
		};

		return context.events.on("openchange", onOpenChange);
	});

	watch(
		[
			() => enabled,
			() => context.open,
			() => context.floating,
			() => isHoverOpen,
		],
		() => {
			if (!enabled) return;
			if (!handleClose) return;
			if (!context.open) return;

			function onLeave(event: MouseEvent) {
				if (!isHoverOpen) return;
				context.onOpenChange(false, event, "hover");
			}

			const html = getDocument(context.floating).documentElement;
			return on(html, "mouseleave", onLeave);
		},
	);

	// Registering the mouse events on the reference directly to bypass Svelte's
	// delegation system. If the cursor was on a disabled element and then entered
	// the reference (no gap), `mouseenter` doesn't fire in the delegation system.
	watch(
		[
			() => context.domReference,
			() => context.floating,
			() => context.reference,
			() => enabled,
			() => mouseOnly,
			() => restMs,
			() => move,
			() => context.open,
			() => tree?.nodes,
			() => delay,
			() => context.data.floatingContext,
			() => isClickLikeOpenEvent,
		],
		() => {
			if (!enabled) return;

			function onMouseEnter(event: MouseEvent) {
				window.clearTimeout(timeout);
				blockMouseMove = false;

				if (
					(mouseOnly && !isMouseLikePointerType(pointerType)) ||
					(restMs > 0 && !getDelay(delay, "open"))
				) {
					return;
				}

				const openDelay = getDelay(delay, "open", pointerType);
				const isOpen = context.open;

				if (openDelay) {
					timeout = window.setTimeout(() => {
						if (!isOpen) {
							context.onOpenChange(true, event, "hover");
						}
					}, openDelay);
				} else if (!context.open) {
					context.onOpenChange(true, event, "hover");
				}
			}

			function onMouseLeave(event: MouseEvent) {
				if (isClickLikeOpenEvent) return;
				const isOpen = context.open;

				unbindMouseMove();

				const doc = getDocument(context.floating);
				window.clearTimeout(restTimeout);
				restTimeoutPending = false;

				if (handleClose && context.data.floatingContext) {
					// Prevent clearing `onScrollMouseLeave` timeout.
					if (!isOpen) {
						window.clearTimeout(timeout);
					}

					handler = handleClose({
						...snapshotFloatingContext(context).current,
						tree: tree,
						x: event.clientX,
						y: event.clientY,
						onClose: () => {
							clearPointerEvents();
							cleanupMouseMoveHandler();
							if (!isClickLikeOpenEvent) {
								closeWithDelay(event, true, "safe-polygon");
							}
						},
					});

					const localHandler = handler;

					doc.addEventListener("mousemove", localHandler);

					unbindMouseMove = () => {
						doc.removeEventListener("mousemove", localHandler);
					};

					return;
				}

				// Allow interactivity without `safePolygon` on touch devices. With a
				// pointer, a short close delay is an alternative, so it should work
				// consistently.
				const shouldClose =
					pointerType === "touch"
						? !contains(context.floating, event.relatedTarget as Element | null)
						: true;
				if (shouldClose) {
					closeWithDelay(event);
				}
			}

			// Ensure the floating element closes after scrolling even if the pointer
			// did not move.
			// https://github.com/floating-ui/floating-ui/discussions/1692
			const onScrollMouseLeave = (event: MouseEvent) => {
				if (isClickLikeOpenEvent) return;
				if (!context.data.floatingContext) return;

				handleClose?.({
					...snapshotFloatingContext(context.data.floatingContext).current,
					tree,
					x: event.clientX,
					y: event.clientY,
					onClose: () => {
						clearPointerEvents();
						cleanupMouseMoveHandler();
						if (!isClickLikeOpenEvent) {
							closeWithDelay(event);
						}
					},
				})(event);
			};
			if (isElement(context.domReference)) {
				const ref = context.domReference as unknown as HTMLElement;
				context.open && ref.addEventListener("mouseleave", onScrollMouseLeave);
				context.floating?.addEventListener("mouseleave", onScrollMouseLeave);
				move && ref.addEventListener("mousemove", onMouseEnter, { once: true });
				ref.addEventListener("mouseenter", onMouseEnter);
				ref.addEventListener("mouseleave", onMouseLeave);
				return () => {
					context.open &&
						ref.removeEventListener("mouseleave", onScrollMouseLeave);
					context.floating?.removeEventListener(
						"mouseleave",
						onScrollMouseLeave,
					);
					move && ref.removeEventListener("mousemove", onMouseEnter);
					ref.removeEventListener("mouseenter", onMouseEnter);
					ref.removeEventListener("mouseleave", onMouseLeave);
				};
			}
		},
	);

	// Block pointer-events of every element other than the reference and floating
	// while the floating element is open and has a `handleClose` handler. Also
	// handles nested floating elements.
	// https://github.com/floating-ui/floating-ui/issues/1722
	watch.pre(
		[
			() => enabled,
			() => context.open,
			() => context.floating,
			() => context.domReference,
			() => handleClose,
			() => isHoverOpen,
			() => tree?.nodes,
		],
		() => {
			if (!enabled) return;
			if (
				context.open &&
				handleClose?.__options.blockPointerEvents &&
				isHoverOpen
			) {
				performedPointerEventsMutation = true;
				const floatingEl = context.floating;
				if (!isElement(context.domReference) || !floatingEl) return;

				const body = getDocument(context.floating).body;
				body.setAttribute(safePolygonIdentifier, "");

				const ref = context.domReference as unknown as
					| HTMLElement
					| SVGSVGElement;

				const parentFloating = tree?.nodes.find((node) => node.id === parentId)
					?.context?.floating;

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

	$effect.pre(() => {
		if (!context.open) {
			pointerType = undefined;
			restTimeoutPending = false;
			cleanupMouseMoveHandler();
			clearPointerEvents();
		}
	});

	watch([() => enabled, () => context.domReference], () => {
		return () => {
			cleanupMouseMoveHandler();
			window.clearTimeout(timeout);
			window.clearTimeout(restTimeout);
			clearPointerEvents();
		};
	});

	const reference = $derived({
		onpointerdown: setPointerType,
		onpointerenter: setPointerType,
		onmousemove: onReferenceMouseMove,
	});

	const floating = $derived({
		onmouseenter: onFloatingMouseEnter,
		onmouseleave: onFloatingMouseLeave,
	});

	return {
		get reference() {
			if (!enabled) return {};
			return reference;
		},
		get floating() {
			if (!enabled) return {};
			return floating;
		},
	};
}

export type { UseHoverOptions, HandleCloseFn };
export { useHover, getDelay };
