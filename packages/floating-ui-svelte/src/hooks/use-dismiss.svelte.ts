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
import type { FloatingTreeType } from "../types.js";
import { useFloatingTree } from "../components/floating-tree/hooks.svelte.js";
import { getChildren } from "../internal/get-children.js";
import { on } from "svelte/events";
import { executeCallbacks } from "../internal/execute-callbacks.js";

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
	enabled?: boolean;
	/**
	 * Whether to dismiss the floating element upon pressing the `esc` key.
	 * @default true
	 */
	escapeKey?: boolean;
	/**
	 * Whether to dismiss the floating element upon pressing the reference
	 * element. You likely want to ensure the `move` option in the `useHover()`
	 * Hook has been disabled when this is in use.
	 * @default false
	 */
	referencePress?: boolean;
	/**
	 * The type of event to use to determine a “press”.
	 * - `pointerdown` is eager on both mouse + touch input.
	 * - `mousedown` is eager on mouse input, but lazy on touch input.
	 * - `click` is lazy on both mouse + touch input.
	 * @default 'pointerdown'
	 */
	referencePressEvent?: "pointerdown" | "mousedown" | "click";
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
	outsidePressEvent?: "pointerdown" | "mousedown" | "click";
	/**
	 * Whether to dismiss the floating element upon scrolling an overflow
	 * ancestor.
	 * @default false
	 */
	ancestorScroll?: boolean;
	/**
	 * Determines whether event listeners bubble upwards through a tree of
	 * floating elements.
	 */
	bubbles?: boolean | { escapeKey?: boolean; outsidePress?: boolean };
	/**
	 * Determines whether to use capture phase event listeners.
	 */
	capture?: boolean | { escapeKey?: boolean; outsidePress?: boolean };
}

class DismissInteraction {
	#enabled = $derived.by(() => this.options.enabled ?? true);
	#escapeKey = $derived.by(() => this.options.escapeKey ?? true);
	#unstable_outsidePress = $derived.by(() => this.options.outsidePress ?? true);
	#outsidePressEvent = $derived.by(
		() => this.options.outsidePressEvent ?? "pointerdown",
	);
	#referencePress = $derived.by(() => this.options.referencePress ?? false);
	#referencePressEvent = $derived.by(
		() => this.options.referencePressEvent ?? "pointerdown",
	);
	#ancestorScroll = $derived.by(() => this.options.ancestorScroll ?? false);
	#bubbles = $derived.by(() => this.options.bubbles);
	#capture = $derived.by(() => this.options.capture);

	#outsidePressFn = $derived.by(() =>
		typeof this.#unstable_outsidePress === "function"
			? this.#unstable_outsidePress
			: () => false,
	);
	#outsidePress = $derived.by(() =>
		typeof this.#unstable_outsidePress === "function"
			? this.#outsidePressFn
			: this.#unstable_outsidePress,
	);
	#bubbleOptions = $derived.by(() => normalizeProp(this.#bubbles));
	#captureOptions = $derived.by(() => normalizeProp(this.#capture));
	#endedOrStartedInside = false;
	#isComposing = false;
	#tree: FloatingTreeType | null;
	#insideTree = false;

	constructor(
		private readonly context: FloatingContext,
		private readonly options: UseDismissOptions = {},
	) {
		this.#tree = useFloatingTree();

		$effect(() => {
			if (!this.context.open || !this.#enabled) return;

			this.context.data.__escapeKeyBubbles = this.#bubbleOptions.escapeKey;
			this.context.data.__outsidePressBubbles =
				this.#bubbleOptions.outsidePress;

			let compositionTimeout = -1;

			const onScroll = (event: Event) => {
				this.context.onOpenChange(false, event, "ancestor-scroll");
			};

			const handleCompositionStart = () => {
				window.clearTimeout(compositionTimeout);
				this.#isComposing = true;
			};

			const handleCompositionEnd = () => {
				// Safari fires `compositionend` before `keydown`, so we need to wait
				// until the next tick to set `isComposing` to `false`.
				// https://bugs.webkit.org/show_bug.cgi?id=165004
				compositionTimeout = window.setTimeout(
					() => {
						this.#isComposing = false;
					},
					// 0ms or 1ms don't work in Safari. 5ms appears to consistently work.
					// Only apply to WebKit for the test to remain 0ms.
					isWebKit() ? 5 : 0,
				);
			};

			const doc = getDocument(this.context.elements.floating);

			const listenersToRemove: Array<() => void> = [];

			if (this.#escapeKey) {
				listenersToRemove.push(
					on(
						doc,
						"keydown",
						this.#captureOptions.escapeKey
							? this.#closeOnEscapeKeyDownCapture
							: this.#closeOnEscapeKeyDown,
					),
					on(doc, "compositionstart", handleCompositionStart),
					on(doc, "compositionend", handleCompositionEnd),
				);
			}

			if (this.#outsidePress) {
				listenersToRemove.push(
					on(
						doc,
						this.#outsidePressEvent,
						this.#captureOptions.outsidePress
							? this.#closeOnPressOutsideCapture
							: this.#closeOnPressOutside,
					),
				);
			}

			let ancestors: (Element | Window | VisualViewport)[] = [];

			if (this.#ancestorScroll) {
				if (isElement(this.context.elements.domReference)) {
					ancestors = getOverflowAncestors(this.context.elements.domReference);
				}

				if (isElement(this.context.elements.floating)) {
					ancestors = ancestors.concat(
						getOverflowAncestors(this.context.elements.floating),
					);
				}

				if (
					!isElement(this.context.elements.reference) &&
					this.context.elements.reference &&
					this.context.elements.reference.contextElement
				) {
					ancestors = ancestors.concat(
						getOverflowAncestors(
							this.context.elements.reference.contextElement,
						),
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
				executeCallbacks(...listenersToRemove);
				window.clearTimeout(compositionTimeout);
			};
		});

		$effect(() => {
			[this.#outsidePress, this.#outsidePressEvent];
			this.#insideTree = false;
		});
	}

	#closeOnEscapeKeyDown(event: KeyboardEvent) {
		if (
			!this.context.open ||
			!this.#enabled ||
			!this.#escapeKey ||
			event.key !== "Escape"
		)
			return;

		// Wait until IME is settled. Pressing `Escape` while composing should
		// close the compose menu, but not the floating element.
		if (this.#isComposing) return;

		const nodeId = this.context.data.floatingContext?.nodeId;
		const children = this.#tree ? getChildren(this.#tree.nodes, nodeId) : [];

		if (!this.#bubbleOptions.escapeKey) {
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

		this.context.onOpenChange(false, event, "escape-key");
	}

	#closeOnEscapeKeyDownCapture(event: KeyboardEvent) {
		const callback = () => {
			this.#closeOnEscapeKeyDown(event);
			getTarget(event)?.removeEventListener("keydown", callback);
		};
		getTarget(event)?.addEventListener("keydown", callback);
	}

	#closeOnPressOutside(event: MouseEvent) {
		const localInsideTree = this.#insideTree;
		this.#insideTree = false;

		// When click outside is lazy (`click` event), handle dragging.
		// Don't close if:
		// - The click started inside the floating element.
		// - The click ended inside the floating element.
		const localEndedOrStartedInside = this.#endedOrStartedInside;
		this.#endedOrStartedInside = false;

		if (this.#outsidePressEvent === "click" && localEndedOrStartedInside) {
			return;
		}

		if (localInsideTree) {
			return;
		}

		if (
			typeof this.#outsidePress === "function" &&
			!this.#outsidePress(event)
		) {
			return;
		}

		const target = getTarget(event);
		const inertSelector = `[${createAttribute("inert")}]`;
		const markers = getDocument(
			this.context.elements.floating,
		).querySelectorAll(inertSelector);

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
			!contains(target, this.context.elements.floating) &&
			// If the target root element contains none of the markers, then the
			// element was injected after the floating element rendered.
			Array.from(markers).every(
				(marker) => !contains(targetRootAncestor, marker),
			)
		) {
			return;
		}

		// Check if the click occurred on the scrollbar
		if (isHTMLElement(target)) {
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

		const nodeId = this.context.data.floatingContext?.nodeId;

		const children = this.#tree ? getChildren(this.#tree.nodes, nodeId) : [];

		const targetIsInsideChildren =
			children.length &&
			children.some((node) =>
				isEventTargetWithin(event, node.context?.elements.floating),
			);

		if (
			isEventTargetWithin(event, this.context.elements.floating) ||
			isEventTargetWithin(event, this.context.elements.domReference) ||
			targetIsInsideChildren
		) {
			return;
		}

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

		this.context.onOpenChange(false, event, "outside-press");
	}

	#closeOnPressOutsideCapture(event: MouseEvent) {
		const callback = () => {
			this.#closeOnPressOutside(event);
			getTarget(event)?.removeEventListener(this.#outsidePressEvent, callback);
		};
		getTarget(event)?.addEventListener(this.#outsidePressEvent, callback);
	}

	readonly reference = $derived.by(() => {
		if (!this.#enabled) return {};
		return {
			onkeydown: this.#closeOnEscapeKeyDown,
			...(this.#referencePress && {
				[bubbleHandlerKeys[this.#referencePressEvent]]: (event: Event) => {
					this.context.onOpenChange(false, event, "reference-press");
				},
				...(this.#referencePressEvent !== "click" && {
					onclick: (event: MouseEvent) => {
						this.context.onOpenChange(false, event, "reference-press");
					},
				}),
			}),
		};
	});

	readonly floating = $derived.by(() => {
		if (!this.#enabled) return {};
		return {
			onkeydown: this.#closeOnEscapeKeyDown,
			onmousedown: () => {
				this.#endedOrStartedInside = true;
			},
			onmouseup: () => {
				this.#endedOrStartedInside = true;
			},
			[captureHandlerKeys[this.#outsidePressEvent]]: () => {
				this.#insideTree = true;
			},
		};
	});

	get enabled() {
		return this.#enabled;
	}
}

function useDismiss(context: FloatingContext, options: UseDismissOptions = {}) {
	return new DismissInteraction(context, options);
}

export type { UseDismissOptions };
export { useDismiss, DismissInteraction as DismissState };
