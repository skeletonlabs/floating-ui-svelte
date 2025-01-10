import { isElement } from "@floating-ui/utils/dom";
import {
	contains,
	createAttribute,
	getDocument,
	isMouseLikePointerType,
} from "../internal/dom.js";
import { noop } from "../internal/noop.js";
import type { ElementProps } from "./use-interactions.svelte.js";
import type { OpenChangeReason } from "../types.js";
import type { FloatingContext } from "./use-floating.svelte.js";

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
		context: FloatingContext & {
			onClose: () => void;
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

function useHover(
	context: FloatingContext,
	options: UseHoverOptions = {},
): ElementProps {
	const {
		enabled = true,
		mouseOnly = false,
		delay = 0,
		restMs = 0,
		move = true,
		handleClose = null,
	} = $derived(options);

	// const tree = useFloatingTree();
	// const parentId = useFloatingParentNodeId();
	let pointerType: string | undefined = undefined;
	let timeout = -1;
	let handler: ((event: MouseEvent) => void) | undefined = undefined;
	let restTimeout = -1;
	let blockMouseMove = true;
	let performedPointerEventsMutation = false;
	let unbindMouseMove = noop;

	const isHoverOpen = $derived.by(() => {
		const type = context.data.openEvent?.type;
		return type?.includes("mouse") && type !== "mousedown";
	});

	const isClickLikeOpenEvent = $derived(
		context.data.openEvent
			? ["click", "mousedown"].includes(context.data.openEvent.type)
			: false,
	);

	$effect(() => {
		if (!enabled) {
			return;
		}

		const onOpenChange = ({ open }: { open: boolean }) => {
			if (!open) {
				clearTimeout(timeout);
				clearTimeout(restTimeout);
				blockMouseMove = true;
			}
		};

		context.events.on("openchange", onOpenChange);
		return () => {
			context.events.off("openchange", onOpenChange);
		};
	});

	$effect(() => {
		if (enabled || !handleClose || !open) {
			return;
		}

		const onLeave = (event: MouseEvent) => {
			if (!isHoverOpen) {
				return;
			}
			context.onOpenChange(false, event, "hover");
		};

		const document = getDocument(context.elements.floating);
		document.addEventListener("mouseleave", onLeave);
		return () => {
			document.removeEventListener("mouseleave", onLeave);
		};
	});

	const closeWithDelay = (
		event: Event,
		runElseBranch = true,
		reason: OpenChangeReason = "hover",
	) => {
		const closeDelay = getDelay(delay, "close", pointerType);
		if (closeDelay && !handler) {
			clearTimeout(timeout);
			timeout = window.setTimeout(
				() => context.onOpenChange(false, event, reason),
				closeDelay,
			);
		} else if (runElseBranch) {
			clearTimeout(timeout);
			context.onOpenChange(false, event, reason);
		}
	};

	const cleanupMouseMoveHandler = () => {
		unbindMouseMove();
		handler = undefined;
	};

	const clearPointerEvents = () => {
		if (!performedPointerEventsMutation) {
			return;
		}
		const body = getDocument(context.elements.floating).body;
		body.style.pointerEvents = "";
		body.removeAttribute(safePolygonIdentifier);
		performedPointerEventsMutation = false;
	};

	// Block pointer-events of every element other than the reference and floating
	// while the floating element is open and has a `handleClose` handler. Also
	// handles nested floating elements.
	// https://github.com/floating-ui/floating-ui/issues/1722
	$effect(() => {
		if (!enabled) {
			return;
		}

		if (
			context.open &&
			handleClose?.__options.blockPointerEvents &&
			isHoverOpen
		) {
			const body = getDocument(context.elements.floating).body;
			body.setAttribute(safePolygonIdentifier, "");
			body.style.pointerEvents = "none";
			performedPointerEventsMutation = true;

			if (isElement(context.elements.reference) && context.elements.floating) {
				const ref = context.elements.reference as unknown as
					| HTMLElement
					| SVGSVGElement;

				// const parentFloating = tree?.nodesRef.current.find((node) => node.id === parentId)?.context
				// 	?.elements.floating;

				// if (parentFloating) {
				// 	parentFloating.style.pointerEvents = '';
				// }

				ref.style.pointerEvents = "auto";
				context.elements.floating.style.pointerEvents = "auto";

				return () => {
					ref.style.pointerEvents = "";
					if (context.elements.floating) {
						context.elements.floating.style.pointerEvents = "";
					}
				};
			}
		}
	});

	$effect(() => {
		if (!open) {
			pointerType = undefined;
			cleanupMouseMoveHandler();
			clearPointerEvents();
		}
	});

	$effect(() => {
		return () => {
			cleanupMouseMoveHandler();
			clearTimeout(timeout);
			clearTimeout(restTimeout);
			clearPointerEvents();
		};
	});

	return {
		get reference() {
			if (!enabled) {
				return {};
			}

			const onmouseenter = (event: MouseEvent) => {
				clearTimeout(timeout);
				blockMouseMove = false;

				if (
					(mouseOnly && !isMouseLikePointerType(pointerType)) ||
					(restMs > 0 && !getDelay(delay, "open"))
				) {
					return;
				}

				const openDelay = getDelay(delay, "open", pointerType);

				if (openDelay) {
					timeout = window.setTimeout(() => {
						context.onOpenChange(true, event, "hover");
					}, openDelay);
				} else {
					context.onOpenChange(true, event, "hover");
				}
			};
			return {
				onpointerdown: (event: PointerEvent) => {
					pointerType = event.pointerType;
				},
				onpointerenter: (event: PointerEvent) => {
					pointerType = event.pointerType;
				},
				onmouseenter,
				onmousemove: (event: MouseEvent) => {
					if (move) {
						onmouseenter(event);
					}
					function handleMouseMove() {
						if (!blockMouseMove) {
							context.onOpenChange(true, event, "hover");
						}
					}

					if (mouseOnly && !isMouseLikePointerType(pointerType)) {
						return;
					}

					if (context.open || restMs === 0) {
						return;
					}

					clearTimeout(restTimeout);

					if (pointerType === "touch") {
						handleMouseMove();
					} else {
						restTimeout = window.setTimeout(handleMouseMove, restMs);
					}
				},
				onmouseleave: (event: MouseEvent) => {
					if (!isClickLikeOpenEvent) {
						unbindMouseMove();

						const doc = getDocument(context.elements.floating);
						clearTimeout(restTimeout);

						if (handleClose) {
							// Prevent clearing `onScrollMouseLeave` timeout.
							if (!open) {
								clearTimeout(timeout);
							}

							handler = handleClose({
								...context,
								// tree,
								x: event.clientX,
								y: event.clientY,
								onClose() {
									clearPointerEvents();
									cleanupMouseMoveHandler();
									closeWithDelay(event, true, "safe-polygon");
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
								? !contains(
										context.elements.floating,
										event.relatedTarget as Element | null,
									)
								: true;
						if (shouldClose) {
							closeWithDelay(event);
						}
					}

					if (context.open && !isClickLikeOpenEvent) {
						handleClose?.({
							...context,
							// tree,
							x: event.clientX,
							y: event.clientY,
							onClose() {
								clearPointerEvents();
								cleanupMouseMoveHandler();
								closeWithDelay(event);
							},
						})(event);
					}
				},
			};
		},

		get floating() {
			if (!enabled) {
				return {};
			}
			return {
				onmouseenter() {
					clearTimeout(timeout);
				},
				onmouseleave(event: MouseEvent) {
					if (!isClickLikeOpenEvent) {
						handleClose?.({
							...context,
							// tree,
							x: event.clientX,
							y: event.clientY,
							onClose() {
								clearPointerEvents();
								cleanupMouseMoveHandler();
								closeWithDelay(event);
							},
						})(event);
					}
					closeWithDelay(event, false);
				},
			};
		},
	};
}

export type { UseHoverOptions };
export { useHover };
