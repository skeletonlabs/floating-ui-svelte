import { isHTMLElement } from "@floating-ui/utils/dom";
import { isMouseLikePointerType, isPointerType } from "../internal/dom.js";
import { isTypeableElement } from "../internal/is-typeable-element.js";
import type { MaybeGetter, ReferenceType } from "../types.js";
import { extract } from "../internal/extract.js";
import type { ElementProps } from "./use-interactions.svelte.js";
import type { FloatingContextData } from "./use-floating-context.svelte.js";

interface UseClickOptions {
	/**
	 * Whether the Hook is enabled, including all internal Effects and event
	 * handlers.
	 * @default true
	 */
	enabled?: MaybeGetter<boolean>;

	/**
	 * The type of event to use to determine a “click” with mouse input.
	 * Keyboard clicks work as normal.
	 * @default 'click'
	 */
	event?: MaybeGetter<"click" | "mousedown">;

	/**
	 * Whether to toggle the open state with repeated clicks.
	 * @default true
	 */
	toggle?: MaybeGetter<boolean>;

	/**
	 * Whether to ignore the logic for mouse input (for example, if `useHover()`
	 * is also being used).
	 * When `useHover()` and `useClick()` are used together, clicking the
	 * reference element after hovering it will keep the floating element open
	 * even once the cursor leaves. This may be not be desirable in some cases.
	 * @default false
	 */
	ignoreMouse?: MaybeGetter<boolean>;

	/**
	 * Whether to add keyboard handlers (Enter and Space key functionality) for
	 * non-button elements (to open/close the floating element via keyboard
	 * “click”).
	 * @default true
	 */
	keyboardHandlers?: MaybeGetter<boolean>;

	/**
	 * If already open from another event such as the `useHover()` Hook,
	 * determines whether to keep the floating element open when clicking the
	 * reference element for the first time.
	 * @default true
	 */
	stickIfOpen?: MaybeGetter<boolean>;
}

function isButtonTarget(event: KeyboardEvent) {
	return isHTMLElement(event.target) && event.target.tagName === "BUTTON";
}

function isSpaceIgnored(element: ReferenceType | null) {
	return isTypeableElement(element);
}

const pointerTypes = ["mouse", "pen", "touch"] as const;

type PointerType = (typeof pointerTypes)[number];

function useClick(
	context: FloatingContextData,
	opts: UseClickOptions = {},
): ElementProps {
	const enabled = $derived(extract(opts.enabled, true));
	const eventOption = $derived(extract(opts.event, "click"));
	const toggle = $derived(extract(opts.toggle, true));
	const ignoreMouse = $derived(extract(opts.ignoreMouse, false));
	const stickIfOpen = $derived(extract(opts.stickIfOpen, true));
	const keyboardHandlers = $derived(extract(opts.keyboardHandlers, true));
	let pointerType: PointerType | undefined = undefined;
	let didKeyDown = false;

	function onpointerdown(event: PointerEvent) {
		if (!isPointerType(event.pointerType)) return;
		pointerType = event.pointerType;
	}

	function onmousedown(event: MouseEvent) {
		// Ignore all buttons except for the "main" button.
		// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
		if (event.button !== 0) return;
		if (eventOption === "click") return;
		if (isMouseLikePointerType(pointerType, true) && ignoreMouse) {
			return;
		}

		if (
			context.open &&
			toggle &&
			(context.data.openEvent && stickIfOpen
				? context.data.openEvent.type === "mousedown"
				: true)
		) {
			context.onOpenChange(false, event, "click");
		} else {
			// Prevent stealing focus from the floating element
			event.preventDefault();
			context.onOpenChange(true, event, "click");
		}
	}

	function onclick(event: MouseEvent) {
		if (eventOption === "mousedown" && pointerType) {
			pointerType = undefined;
			return;
		}

		if (isMouseLikePointerType(pointerType, true) && ignoreMouse) return;

		if (
			context.open &&
			toggle &&
			(context.data.openEvent && stickIfOpen
				? context.data.openEvent.type === "click"
				: true)
		) {
			context.onOpenChange(false, event, "click");
		} else {
			context.onOpenChange(true, event, "click");
		}
	}

	function onkeydown(event: KeyboardEvent) {
		pointerType = undefined;

		if (event.defaultPrevented || !keyboardHandlers || isButtonTarget(event)) {
			return;
		}

		if (event.key === " " && !isSpaceIgnored(context.elements.domReference)) {
			// Prevent scrolling
			event.preventDefault();
			didKeyDown = true;
		}

		if (event.key === "Enter") {
			if (context.open && toggle) {
				context.onOpenChange(false, event, "click");
			} else {
				context.onOpenChange(true, event, "click");
			}
		}
	}

	function onkeyup(event: KeyboardEvent) {
		if (
			event.defaultPrevented ||
			!keyboardHandlers ||
			isButtonTarget(event) ||
			isSpaceIgnored(context.elements.domReference)
		) {
			return;
		}

		if (event.key === " " && didKeyDown) {
			didKeyDown = false;
			if (context.open && toggle) {
				context.onOpenChange(false, event, "click");
			} else {
				context.onOpenChange(true, event, "click");
			}
		}
	}

	const reference = $derived({
		onpointerdown: onpointerdown,
		onmousedown: onmousedown,
		onclick: onclick,
		onkeydown: onkeydown,
		onkeyup: onkeyup,
	});

	return {
		get reference() {
			if (!enabled) return {};
			return reference;
		},
	};
}

export type { UseClickOptions };
export { useClick };
