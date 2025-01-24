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
import { watch } from "../internal/watch.svelte.js";
import { extract } from "../internal/extract.js";
import type { ElementProps } from "./use-interactions.svelte.js";
import { sleep } from "../internal/sleep.js";
import { PositionContext } from "../internal/position-context.js";

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

function useHover(context: FloatingContext, opts: UseHoverOptions = {}) {
	const enabled = $derived(extract(opts.enabled, true));
	const delay = $derived(extract(opts.delay, 0));
	const handleClose = opts.handleClose ?? null;
	const mouseOnly = $derived(extract(opts.mouseOnly, false));
	const restMs = $derived(extract(opts.restMs, 0));
	const move = $derived(extract(opts.move, true));

	const tree = useFloatingTree();
	const parentId = useFloatingParentNodeId();
	const positionContext = PositionContext.get();

	let pointerType: PointerType | undefined;
	let timeout = -1;
	let handler: ((e: MouseEvent) => void) | undefined = noop;
	let restTimeout = -1;
	let blockMouseMove = true;
	let performedPointerEventsMutation = false;
	let unbindMouseMove = noop;
	let restTimeoutPending = false;

	function isHoverOpen() {
		const type = context.data.openEvent?.type;
		return type?.includes("mouse") && type !== "mousedown";
	}

	watch([() => enabled, () => context.events], () => {
		if (!enabled) return;

		function onOpenChange({ open }: { open: boolean }) {
			if (open) return;
			window.clearTimeout(timeout);
			window.clearTimeout(restTimeout);
			blockMouseMove = true;
			restTimeoutPending = false;
		}

		return context.events.on("openchange", onOpenChange);
	});

	watch(
		[() => enabled, () => context.open, () => context.floating],
		([isEnabled, isOpen, floatingEl]) => {
			if (!isEnabled) return;
			if (!handleClose) return;
			if (!isOpen) return;

			function onLeave(event: MouseEvent) {
				if (isHoverOpen()) {
					context.onOpenChange(false, event, "hover");
				}
			}

			const html = getDocument(floatingEl).documentElement;

			html.addEventListener("mouseleave", onLeave);
			return () => {
				html.removeEventListener("mouseleave", onLeave);
			};
		},
	);

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
			clearTimeout(timeout);
			context.onOpenChange(false, event, reason);
		}
	}

	function cleanupMouseMoveHandler() {
		unbindMouseMove();
		handler = undefined;
	}

	function clearPointerEvents() {
		if (performedPointerEventsMutation) {
			const body = getDocument(context.floating).body;
			body.style.pointerEvents = "";
			body.removeAttribute(safePolygonIdentifier);
			performedPointerEventsMutation = false;
		}
	}

	function isClickLikeOpenEvent() {
		return context.data.openEvent
			? ["click", "mousedown"].includes(context.data.openEvent.type)
			: false;
	}

	// Ensure the floating element closes after scrolling even if the pointer
	// did not move.
	// https://github.com/floating-ui/floating-ui/discussions/1692
	function onScrollMouseLeave(event: MouseEvent) {
		if (isClickLikeOpenEvent()) return;
		if (!context.data.floatingContext) return;

		handleClose?.({
			...snapshotFloatingContext(context.data.floatingContext).current,
			tree,
			x: event.clientX,
			y: event.clientY,
			onClose() {
				clearPointerEvents();
				cleanupMouseMoveHandler();
				if (!isClickLikeOpenEvent()) {
					closeWithDelay(event);
				}
			},
		})(event);
	}

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

		if (openDelay) {
			timeout = window.setTimeout(() => {
				if (!context.open) {
					context.onOpenChange(true, event, "hover");
				}
			}, openDelay);
		} else if (!context.open) {
			context.onOpenChange(true, event, "hover");
		}
	}

	function onMouseLeave(event: MouseEvent) {
		if (isClickLikeOpenEvent()) return;

		unbindMouseMove();

		const doc = getDocument(context.floating);

		window.clearTimeout(restTimeout);
		restTimeoutPending = false;

		if (handleClose && context.data.floatingContext) {
			// Prevent clearing `onScrollMouseLeave` timeout.
			if (!context.open) {
				window.clearTimeout(timeout);
			}

			handler = handleClose({
				...snapshotFloatingContext(context.data.floatingContext).current,
				tree,
				x: event.clientX,
				y: event.clientY,
				onClose: () => {
					clearPointerEvents();
					cleanupMouseMoveHandler();
					if (!isClickLikeOpenEvent()) {
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

	$effect(() => {
		if (!enabled) return;

		if (isElement(context.domReference)) {
			const ref = context.domReference as unknown as HTMLElement;

			if (move) {
				ref.addEventListener("mousemove", onMouseEnter, { once: true });
				return () => {
					ref.removeEventListener("mousemove", onMouseEnter);
				};
			}
		}
	});

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
			() => tree?.nodes,
			() => context.reference,
		],
		([isEnabled, isOpen, floating, domReference, treeNodes]) => {
			if (!isEnabled) return;

			if (
				isOpen &&
				handleClose?.__options.blockPointerEvents &&
				isHoverOpen()
			) {
				console.log("blocking pointer events for floating", floating);

				performedPointerEventsMutation = true;

				if (isElement(domReference) && floating) {
					const body = getDocument(floating).body;
					body.setAttribute(safePolygonIdentifier, "");

					const parentContext = treeNodes?.find(
						(node) => node.id === parentId,
					)?.context;

					if (parentContext?.floating) {
						parentContext.__position.floatingPointerEvents = undefined;
					}

					body.style.pointerEvents = "none";
					domReference.style.pointerEvents = "auto";
					context.__position.floatingPointerEvents = "auto";

					console.log(getComputedStyle(floating).pointerEvents);

					return () => {
						body.style.pointerEvents = "";
						domReference.style.pointerEvents = "";
						context.__position.floatingPointerEvents = undefined;
					};
				}
			}
		},
	);

	watch.pre(
		() => context.open,
		(isOpen) => {
			if (isOpen) return;
			pointerType = undefined;
			restTimeoutPending = false;
			cleanupMouseMoveHandler();
			clearPointerEvents();
		},
	);

	watch([() => enabled, () => context.domReference], () => {
		return () => {
			cleanupMouseMoveHandler();
			window.clearTimeout(timeout);
			window.clearTimeout(restTimeout);
			clearPointerEvents();
		};
	});

	function setPointerType(event: PointerEvent) {
		pointerType = isPointerType(event.pointerType)
			? event.pointerType
			: undefined;
	}

	const reference: ElementProps["reference"] = {
		onpointerdown: (event) => setPointerType(event),
		onpointerenter: (event) => setPointerType(event),
		onmouseenter: (event) => {
			onMouseEnter(event);
		},
		onmousemove: (event) => {
			const isOpen = context.open;
			function handleMouseMove() {
				if (!blockMouseMove && !isOpen) {
					context.onOpenChange(true, event, "hover");
				}
			}

			if (mouseOnly && !isMouseLikePointerType(pointerType)) {
				return;
			}

			if (isOpen || restMs === 0) return;

			// ignore insignificant mouse movements to account for tremors
			if (
				restTimeoutPending &&
				event.movementX ** 2 + event.movementY ** 2 < 2
			) {
				return;
			}

			window.clearTimeout(restTimeout);

			if (pointerType === "touch") {
				handleMouseMove();
			} else {
				restTimeoutPending = true;
				restTimeout = window.setTimeout(handleMouseMove, restMs);
			}
		},
		onmouseleave: (event) => {
			onMouseLeave(event);
			if (!context.open) return;
			onScrollMouseLeave(event);
		},
	};

	const floating: ElementProps["floating"] = {
		onmouseenter: () => {
			window.clearTimeout(timeout);
		},
		onmouseleave: (event) => {
			onScrollMouseLeave(event);
			if (!isClickLikeOpenEvent()) {
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
