import {
	getOverflowAncestors,
	getParentNode,
	isElement,
	isHTMLElement,
	isLastTraversableNode,
	isWebKit,
} from "@floating-ui/utils/dom";
import {
	contains,
	createAttribute,
	getDocument,
	getTarget,
	isEventTargetWithin,
	isRootElement,
} from "../internal/dom.js";
import type { FloatingContext } from "./use-floating.svelte.js";
import type { MaybeGetter } from "../types.js";
import { useFloatingTree } from "../components/floating-tree/hooks.svelte.js";
import { getChildren } from "../internal/get-children.js";
import { on } from "svelte/events";
import { extract } from "../internal/extract.js";
import { watch } from "../internal/watch.svelte.js";
import type { ElementProps } from "./use-interactions.svelte.js";
import { FLOATING_ID_ATTRIBUTE } from "../internal/attributes.js";

const bubbleHandlerKeys = {
	pointerdown: "onpointerdown",
	mousedown: "onmousedown",
	click: "onclick",
};

const captureHandlerKeys = {
	pointerdown: "onpointerdowncapture",
	mousedown: "onmousedowncapture",
	click: "onclickcapture",
};

function normalizeProp(
	normalizable?: boolean | { escapeKey?: boolean; outsidePress?: boolean },
) {
	return {
		escapeKey:
			typeof normalizable === "boolean"
				? normalizable
				: (normalizable?.escapeKey ?? false),
		outsidePress:
			typeof normalizable === "boolean"
				? normalizable
				: (normalizable?.outsidePress ?? true),
	};
}

interface UseDismissOptions {
	/**
	 * Whether the Hook is enabled, including all internal Effects and event
	 * handlers.
	 * @default true
	 */
	enabled?: MaybeGetter<boolean>;
	/**
	 * Whether to dismiss the floating element upon pressing the `esc` key.
	 * @default true
	 */
	escapeKey?: MaybeGetter<boolean>;
	/**
	 * Whether to dismiss the floating element upon pressing the reference
	 * element. You likely want to ensure the `move` option in the `useHover()`
	 * Hook has been disabled when this is in use.
	 * @default false
	 */
	referencePress?: MaybeGetter<boolean>;
	/**
	 * The type of event to use to determine a “press”.
	 * - `pointerdown` is eager on both mouse + touch input.
	 * - `mousedown` is eager on mouse input, but lazy on touch input.
	 * - `click` is lazy on both mouse + touch input.
	 * @default 'pointerdown'
	 */
	referencePressEvent?: MaybeGetter<"pointerdown" | "mousedown" | "click">;
	/**
	 * Whether to dismiss the floating element upon pressing outside of the
	 * floating element.
	 * If you have another element, like a toast, that is rendered outside the
	 * floating element’s React tree and don’t want the floating element to close
	 * when pressing it, you can guard the check like so:
	 * ```jsx
	 * useDismiss(context, {
	 *   outsidePress: (event) => !event.target.closest('.toast'),
	 * });
	 * ```
	 * @default true
	 */
	outsidePress?: boolean | ((event: MouseEvent) => boolean);
	/**
	 * The type of event to use to determine an outside “press”.
	 * - `pointerdown` is eager on both mouse + touch input.
	 * - `mousedown` is eager on mouse input, but lazy on touch input.
	 * - `click` is lazy on both mouse + touch input.
	 * @default 'pointerdown'
	 */
	outsidePressEvent?: MaybeGetter<"pointerdown" | "mousedown" | "click">;
	/**
	 * Whether to dismiss the floating element upon scrolling an overflow
	 * ancestor.
	 * @default false
	 */
	ancestorScroll?: MaybeGetter<boolean>;
	/**
	 * Determines whether event listeners bubble upwards through a tree of
	 * floating elements.
	 */
	bubbles?: MaybeGetter<
		boolean | { escapeKey?: boolean; outsidePress?: boolean }
	>;
	/**
	 * Determines whether to use capture phase event listeners.
	 */
	capture?: MaybeGetter<
		boolean | { escapeKey?: boolean; outsidePress?: boolean }
	>;
}

function useDismiss(
	context: FloatingContext,
	opts: UseDismissOptions = {},
): ElementProps {
	const enabled = $derived(extract(opts.enabled, true));
	const escapeKey = $derived(extract(opts.escapeKey, true));
	const outsidePressProp = $derived(opts.outsidePress ?? true);
	const outsidePressEvent = $derived(
		extract(opts.outsidePressEvent, "pointerdown"),
	);
	const referencePress = $derived(extract(opts.referencePress, false));
	const referencePressEvent = $derived(
		extract(opts.referencePressEvent, "pointerdown"),
	);
	const ancestorScroll = $derived(extract(opts.ancestorScroll, false));
	const bubbles = $derived(extract(opts.bubbles));
	const capture = $derived(extract(opts.capture));
	const tree = useFloatingTree();

	const outsidePressFn = $derived(
		typeof outsidePressProp === "function" ? outsidePressProp : () => false,
	);
	const outsidePress = $derived(
		typeof outsidePressProp === "function" ? outsidePressFn : outsidePressProp,
	);
	const bubbleOptions = $derived(normalizeProp(bubbles));
	const captureOptions = $derived(normalizeProp(capture));

	let endedOrStartedInside = false;
	let isComposing = false;
	let insideTree = false;

	function closeOnEscapeKeyDown(event: KeyboardEvent) {
		if (!context.open || !enabled || !escapeKey || event.key !== "Escape")
			return;

		// Wait until IME is settled. Pressing `Escape` while composing should
		// close the compose menu, but not the floating element.
		if (isComposing) return;

		const nodeId = context.data.floatingContext?.nodeId;
		const children = tree ? getChildren(tree?.nodes, nodeId) : [];

		if (!bubbleOptions.escapeKey) {
			event.stopPropagation();

			if (children.length > 0) {
				let shouldDismiss = true;

				for (const child of children) {
					if (child.context?.open && !child.context.data.__escapeKeyBubbles) {
						shouldDismiss = false;
						break;
					}
				}

				if (!shouldDismiss) return;
			}
		}

		context.onOpenChange(false, event, "escape-key");
	}

	function closeOnEscapeKeyDownCapture(event: KeyboardEvent) {
		const callback = () => {
			closeOnEscapeKeyDown(event);
			getTarget(event)?.removeEventListener("keydown", callback);
		};
		getTarget(event)?.addEventListener("keydown", callback);
	}

	function closeOnPressOutside(event: MouseEvent) {
		const localInsideTree = insideTree;
		insideTree = false;

		// When click outside is lazy (`click` event), handle dragging.
		// Don't close if:
		// - The click started inside the floating element.
		// - The click ended inside the floating element.
		const localEndedOrStartedInside = endedOrStartedInside;
		endedOrStartedInside = false;

		if (outsidePressEvent === "click" && localEndedOrStartedInside) {
			return;
		}

		if (localInsideTree) return;

		if (typeof outsidePress === "function" && !outsidePress(event)) {
			return;
		}

		const target = getTarget(event);
		const inertSelector = `[${createAttribute("inert")}]`;
		const markers = getDocument(context.floating).querySelectorAll(
			inertSelector,
		);

		let targetRootAncestor = isElement(target) ? target : null;

		while (targetRootAncestor && !isLastTraversableNode(targetRootAncestor)) {
			const nextParent = getParentNode(targetRootAncestor);
			if (isLastTraversableNode(nextParent) || !isElement(nextParent)) break;

			targetRootAncestor = nextParent;
		}

		// Check if the click occurred on a third-party element injected after the
		// floating element rendered.
		if (
			markers.length &&
			isElement(target) &&
			!isRootElement(target) &&
			// Clicked on a direct ancestor (e.g. FloatingOverlay).
			!contains(target, context.floating) &&
			// If the target root element contains none of the markers, then the
			// element was injected after the floating element rendered.
			Array.from(markers).every(
				(marker) => !contains(targetRootAncestor, marker),
			)
		) {
			return;
		}

		// Check if the click occurred on the scrollbar
		if (isHTMLElement(target) && context.floating) {
			const lastTraversableNode = isLastTraversableNode(target);
			const style = getComputedStyle(target);
			const scrollRe = /auto|scroll/;
			const isScrollableX =
				lastTraversableNode || scrollRe.test(style.overflowX);
			const isScrollableY =
				lastTraversableNode || scrollRe.test(style.overflowY);

			const canScrollX =
				isScrollableX &&
				target.clientWidth > 0 &&
				target.scrollWidth > target.clientWidth;
			const canScrollY =
				isScrollableY &&
				target.clientHeight > 0 &&
				target.scrollHeight > target.clientHeight;

			const isRTL = style.direction === "rtl";

			// Check click position relative to scrollbar.
			// In some browsers it is possible to change the <body> (or window)
			// scrollbar to the left side, but is very rare and is difficult to
			// check for. Plus, for modal dialogs with backdrops, it is more
			// important that the backdrop is checked but not so much the window.
			const pressedVerticalScrollbar =
				canScrollY &&
				(isRTL
					? event.offsetX <= target.offsetWidth - target.clientWidth
					: event.offsetX > target.clientWidth);

			const pressedHorizontalScrollbar =
				canScrollX && event.offsetY > target.clientHeight;

			if (pressedVerticalScrollbar || pressedHorizontalScrollbar) {
				return;
			}
		}

		const nodeId = context.data.floatingContext?.nodeId;

		const targetIsInsideChildren =
			tree &&
			getChildren(tree?.nodes, nodeId).some((node) =>
				isEventTargetWithin(event, node.context?.floating),
			);

		if (
			isEventTargetWithin(event, context.floating) ||
			isEventTargetWithin(event, context.domReference) ||
			targetIsInsideChildren
		) {
			return;
		}

		const children = tree ? getChildren(tree?.nodes, nodeId) : [];

		if (children.length > 0) {
			let shouldDismiss = true;

			for (const child of children) {
				if (child.context?.open && !child.context.data.__outsidePressBubbles) {
					shouldDismiss = false;
					break;
				}
			}

			if (!shouldDismiss) return;
		}

		// if the event occurred inside a portal created within this floating element, return
		const closestPortalOrigin = isElement(target)
			? target.closest("[data-floating-ui-origin-id]")
			: null;

		if (
			closestPortalOrigin &&
			closestPortalOrigin.getAttribute("data-floating-ui-origin-id") ===
				context.floatingId
		)
			return;

		context.onOpenChange(false, event, "outside-press");
	}

	function closeOnPressOutsideCapture(event: MouseEvent) {
		const callback = () => {
			closeOnPressOutside(event);
			getTarget(event)?.removeEventListener(outsidePressEvent, callback);
		};
		getTarget(event)?.addEventListener(outsidePressEvent, callback);
	}

	function onScroll(event: Event) {
		context.onOpenChange(false, event, "ancestor-scroll");
	}

	let compositionTimeout = -1;

	function handleCompositionStart() {
		window.clearTimeout(compositionTimeout);
		isComposing = true;
	}

	function handleCompositionEnd() {
		// Safari fires `compositionend` before `keydown`, so we need to wait
		// until the next tick to set `isComposing` to `false`.
		// https://bugs.webkit.org/show_bug.cgi?id=165004
		compositionTimeout = window.setTimeout(
			() => {
				isComposing = false;
			},
			// 0ms or 1ms don't work in Safari. 5ms appears to consistently work.
			// Only apply to WebKit for the test to remain 0ms.
			isWebKit() ? 5 : 0,
		);
	}

	$effect.pre(() => {
		if (!context.open || !enabled) return;
		context.data.__escapeKeyBubbles = bubbleOptions.escapeKey;
		context.data.__outsidePressBubbles = bubbleOptions.outsidePress;

		const doc = getDocument(context.floating);
		const listenersToRemove: Array<() => void> = [];

		if (escapeKey) {
			listenersToRemove.push(
				on(
					doc,
					"keydown",
					captureOptions.escapeKey
						? closeOnEscapeKeyDownCapture
						: closeOnEscapeKeyDown,
					{ capture: captureOptions.escapeKey },
				),
				on(doc, "compositionstart", handleCompositionStart),
				on(doc, "compositionend", handleCompositionEnd),
			);
		}

		if (outsidePress) {
			listenersToRemove.push(
				on(
					doc,
					outsidePressEvent,
					captureOptions.outsidePress
						? closeOnPressOutsideCapture
						: closeOnPressOutside,
					{ capture: captureOptions.outsidePress },
				),
			);
		}

		let ancestors: (Element | Window | VisualViewport)[] = [];

		if (ancestorScroll) {
			if (isElement(context.domReference)) {
				ancestors = getOverflowAncestors(context.domReference);
			}

			if (isElement(context.floating)) {
				ancestors = ancestors.concat(getOverflowAncestors(context.floating));
			}

			if (
				!isElement(context.reference) &&
				context.reference &&
				context.reference.contextElement
			) {
				ancestors = ancestors.concat(
					getOverflowAncestors(context.reference.contextElement),
				);
			}
		}

		// Ignore the visual viewport for scrolling dismissal (allow pinch-zoom)
		ancestors = ancestors.filter(
			(ancestor) => ancestor !== doc.defaultView?.visualViewport,
		);

		for (const ancestor of ancestors) {
			listenersToRemove.push(
				on(ancestor, "scroll", onScroll, { passive: true }),
			);
		}

		return () => {
			for (const removeListener of listenersToRemove) {
				removeListener();
			}
			window.clearTimeout(compositionTimeout);
		};
	});

	watch.pre([() => outsidePress, () => outsidePressEvent], () => {
		insideTree = false;
	});

	const reference = $derived({
		onkeydown: closeOnEscapeKeyDown,
		...(referencePress && {
			[bubbleHandlerKeys[referencePressEvent]]: (event: Event) => {
				context.onOpenChange(false, event, "reference-press");
			},
			...(referencePressEvent !== "click" && {
				onclick: (event: MouseEvent) => {
					context.onOpenChange(false, event, "reference-press");
				},
			}),
		}),
	});

	const floating = $derived({
		onkeydown: closeOnEscapeKeyDown,
		onmousedown: () => {
			endedOrStartedInside = true;
		},
		onmouseup: () => {
			endedOrStartedInside = true;
		},
		[captureHandlerKeys[outsidePressEvent]]: () => {
			insideTree = true;
		},
		[FLOATING_ID_ATTRIBUTE]: context.floatingId,
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

export type { UseDismissOptions };
export { useDismiss, normalizeProp };
