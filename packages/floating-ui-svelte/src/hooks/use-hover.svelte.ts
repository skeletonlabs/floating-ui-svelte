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
import { snapshotFloatingContext } from "../internal/snapshot.svelte.js";
import { extract } from "../internal/extract.js";
import type { ElementProps } from "./use-interactions.svelte.js";
import { on } from "svelte/events";
import { sleep } from "../internal/sleep.js";
import { untrack } from "svelte";

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
	 * Time in ms that the pointer must rest on the reference element before the open state
	 * is set to true.
	 * @default 0
	 */
	restMs?: MaybeGetter<number>;

	/**
	 * Whether moving the pointer over the reference element will open its floating
	 * element without a regular hover event required.
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

/**
 * Returns the delay value for the given prop.
 */
function getDelay(
	value: number | DelayOptions,
	prop: "open" | "close",
	pointerType?: PointerType,
) {
	if (pointerType && !isMouseLikePointerType(pointerType)) return 0;
	if (typeof value === "number") return value;
	return value?.[prop];
}

function useHover(context: FloatingContext, opts: UseHoverOptions = {}) {
	const enabled = $derived(extract(opts.enabled, true));
	const delay = $derived(extract(opts.delay, 0));
	const handleClose = opts.handleClose ?? null;
	const mouseOnly = $derived(extract(opts.mouseOnly, false));
	const restMs = $derived(extract(opts.restMs, 0));
	const move = $derived(extract(opts.move, true));

	const tree = useFloatingTree();
	const parentId = useFloatingParentNodeId();

	let pointerType: PointerType | undefined;
	let openChangeTimeout = -1;
	let restOpenChangeTimeout = -1;
	let restTimeoutPending = false;
	let handler: ((e: MouseEvent) => void) | undefined = noop;
	let blockMouseMove = true;
	let unbindMouseMove = noop;
	let clearPointerEvents = noop;

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
		if (!enabled) return;

		function onOpenChange({ open }: { open: boolean }) {
			if (open) return;
			window.clearTimeout(openChangeTimeout);
			window.clearTimeout(restOpenChangeTimeout);
			blockMouseMove = true;
			restTimeoutPending = false;
		}

		return context.events.on("openchange", onOpenChange);
	});

	function htmlOnLeave(event: MouseEvent) {
		if (isHoverOpen) {
			context.onOpenChange(false, event, "hover");
		}
	}

	$effect(() => {
		if (!enabled) return;
		if (!handleClose) return;
		if (!context.open) return;

		const html = getDocument(context.floating).documentElement;
		return on(html, "mouseleave", htmlOnLeave);
	});

	function closeWithDelay(
		event: Event,
		runElseBranch = true,
		reason: OpenChangeReason = "hover",
	) {
		const closeDelay = getDelay(delay, "close", pointerType);
		if (closeDelay && !handler) {
			window.clearTimeout(openChangeTimeout);
			openChangeTimeout = window.setTimeout(
				() => context.onOpenChange(false, event, reason),
				closeDelay,
			);
		} else if (runElseBranch) {
			clearTimeout(openChangeTimeout);
			context.onOpenChange(false, event, reason);
		}
	}

	function cleanupMouseMoveHandler() {
		unbindMouseMove();
		handler = undefined;
	}

	// Ensure the floating element closes after scrolling even if the pointer
	// did not move.
	// https://github.com/floating-ui/floating-ui/discussions/1692
	// function onScrollMouseLeave(event: MouseEvent) {
	// 	if (isClickLikeOpenEvent) return;
	// 	if (!context.data.floatingContext) return;

	// 	handleClose?.({
	// 		...snapshotFloatingContext(context.data.floatingContext).current,
	// 		tree,
	// 		x: event.clientX,
	// 		y: event.clientY,
	// 		onClose() {
	// 			clearPointerEvents();
	// 			cleanupMouseMoveHandler();
	// 			if (!isClickLikeOpenEvent) {
	// 				closeWithDelay(event);
	// 			}
	// 		},
	// 	})(event);
	// }

	function onReferenceMouseEnter(event: MouseEvent) {
		window.clearTimeout(openChangeTimeout);
		blockMouseMove = false;

		const failedMouseOnlyCheck =
			mouseOnly && !isMouseLikePointerType(pointerType);
		const failedRestMsCheck = restMs > 0 && !getDelay(delay, "open");

		if (failedMouseOnlyCheck || failedRestMsCheck) return;

		const openDelay = getDelay(delay, "open", pointerType);

		if (openDelay) {
			// if there is an open delay, we set a timeout to open the floating element
			// after the delay has passed
			openChangeTimeout = window.setTimeout(() => {
				if (!context.open) {
					context.onOpenChange(true, event, "hover");
				}
			}, openDelay);
		} else if (!context.open) {
			// if no delay and the floating element is not open, we open it immediately
			context.onOpenChange(true, event, "hover");
		}
	}

	function onReferenceMouseLeave(event: MouseEvent) {
		console.log("onreferencemouseleave");
		// if opened via a click-like event, we don't handle the mouseleave event
		if (isClickLikeOpenEvent) return;

		// clean up any existing mousemove listeners
		unbindMouseMove();

		const doc = getDocument(context.floating);

		// clear the rest timeout and set pending to false
		window.clearTimeout(restOpenChangeTimeout);
		restTimeoutPending = false;

		if (handleClose && context.data.floatingContext) {
			console.log("handling close");
			// if not open already, we clear any open change timeouts that may
			// be pending
			if (!context.open) {
				console.log("not open");
				window.clearTimeout(openChangeTimeout);
			}

			handler = handleClose({
				...snapshotFloatingContext(context.data.floatingContext).current,
				tree,
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

			// kick off a mousemove listener to handle movements
			unbindMouseMove = on(doc, "mousemove", localHandler);

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

	$effect(() => {
		if (!enabled) return;
		if (isElement(context.domReference) && move) {
			return on(
				context.domReference,
				"mousemove",
				(e) => {
					onReferenceMouseEnter(e);
				},
				{
					once: true,
				},
			);
		}
	});

	function disableBodyPointerEvents() {
		const body = getDocument(context.floating).body;
		body.setAttribute(safePolygonIdentifier, "");
		body.style.pointerEvents = "none";

		return () => {
			body.style.pointerEvents = "";
			body.removeAttribute(safePolygonIdentifier);
		};
	}

	// Block pointer-events of every element other than the reference and floating
	// while the floating element is open and has a `handleClose` handler. Also
	// handles nested floating elements.
	// https://github.com/floating-ui/floating-ui/issues/1722
	$effect.pre(() => {
		if (
			!enabled ||
			!context.open ||
			!handleClose?.__options.blockPointerEvents ||
			!untrack(() => isHoverOpen)
		) {
			return;
		}

		const floatingEl = context.floating;
		const domReferenceEl = context.domReference;
		if (!isElement(domReferenceEl) || !floatingEl) return;

		const parentContext = tree?.nodes?.find(
			(node) => node.id === parentId,
		)?.context;

		if (parentContext) {
			parentContext.__position.setFloatingPointerEvents("inherit");
		}

		clearPointerEvents = disableBodyPointerEvents();
		domReferenceEl.style.pointerEvents = "auto";

		context.__position.setFloatingPointerEvents("auto");

		return () => {
			clearPointerEvents();
			domReferenceEl.style.pointerEvents = "";
			context.__position.setFloatingPointerEvents(undefined);
		};
	});

	$effect.pre(() => {
		if (context.open) return;
		pointerType = undefined;
		restTimeoutPending = false;
		cleanupMouseMoveHandler();
		clearPointerEvents();
	});

	$effect(() => {
		[enabled, context.domReference];
		return () => {
			cleanupMouseMoveHandler();
			window.clearTimeout(openChangeTimeout);
			window.clearTimeout(restOpenChangeTimeout);
			clearPointerEvents();
		};
	});

	function handleReferenceMouseMove(event: MouseEvent) {
		/**
		 * if we aren't blocking the mousemove event and the floating element isn't open,
		 * we open the floating element on mousemove via the reference.
		 */
		if (!blockMouseMove && !context.open) {
			context.onOpenChange(true, event, "hover");
		}
	}

	/**
	 * Set the latest pointer type that triggered an event on the
	 * reference element.
	 */
	function setPointerType(event: PointerEvent) {
		pointerType = isPointerType(event.pointerType)
			? event.pointerType
			: undefined;
	}

	function isInsignificantMovement(event: MouseEvent) {
		return (
			restTimeoutPending && event.movementX ** 2 + event.movementY ** 2 < 2
		);
	}

	function onReferenceMouseMove(event: MouseEvent) {
		if (mouseOnly && !isMouseLikePointerType(pointerType)) return;
		// if the floating element is open, or the rest timeout is 0, we don't
		// do anything here.
		if (context.open || restMs === 0) return;

		// ignore insignificant mouse movements to account for tremors
		if (isInsignificantMovement(event)) return;

		// clear open change rest timeout
		window.clearTimeout(restOpenChangeTimeout);

		// if it is a touch event, we cut to the chase and handle the mousemove
		if (pointerType === "touch") {
			handleReferenceMouseMove(event);
		} else {
			// otherwise, we set a timeout to handle the mousemove event
			// based on the restMs prop
			restTimeoutPending = true;
			restOpenChangeTimeout = window.setTimeout(
				() => handleReferenceMouseMove(event),
				restMs,
			);
		}
	}

	const reference: ElementProps["reference"] = {
		onpointerdown: setPointerType,
		onpointerenter: setPointerType,
		onmouseenter: onReferenceMouseEnter,
		onmousemove: onReferenceMouseMove,
		onmouseleave: onReferenceMouseLeave,
	};

	const floating: ElementProps["floating"] = {
		onmouseenter: () => {
			// when we enter the floating element, we clear any existing open change timeouts
			// to prevent a close event from firing
			window.clearTimeout(openChangeTimeout);
		},
		onmouseleave: (event) => {
			// when we leave, if not opened via a click-like event, we close it.
			if (!isClickLikeOpenEvent) {
				closeWithDelay(event, false);
			}
		},
	};

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
