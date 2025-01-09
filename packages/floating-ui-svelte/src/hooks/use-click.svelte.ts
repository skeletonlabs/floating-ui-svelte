import { isHTMLElement } from "@floating-ui/utils/dom";
import { isMouseLikePointerType } from "../internal/dom.js";
import { isTypeableElement } from "../internal/is-typeable-element.js";
import type { ElementProps } from "./use-interactions.svelte.js";
import type { FloatingContext } from "../types.js";

interface UseClickOptions {
	/**
	 * Whether the Hook is enabled, including all internal Effects and event
	 * handlers.
	 * @default true
	 */
	enabled?: boolean;

	/**
	 * The type of event to use to determine a “click” with mouse input.
	 * Keyboard clicks work as normal.
	 * @default 'click'
	 */
	event?: "click" | "mousedown";

	/**
	 * Whether to toggle the open state with repeated clicks.
	 * @default true
	 */
	toggle?: boolean;

	/**
	 * Whether to ignore the logic for mouse input (for example, if `useHover()`
	 * is also being used).
	 * When `useHover()` and `useClick()` are used together, clicking the
	 * reference element after hovering it will keep the floating element open
	 * even once the cursor leaves. This may be not be desirable in some cases.
	 * @default false
	 */
	ignoreMouse?: boolean;

	/**
	 * Whether to add keyboard handlers (Enter and Space key functionality) for
	 * non-button elements (to open/close the floating element via keyboard
	 * “click”).
	 * @default true
	 */
	keyboardHandlers?: boolean;
}

function isButtonTarget(event: KeyboardEvent) {
	return isHTMLElement(event.target) && event.target.tagName === "BUTTON";
}

function isSpaceIgnored(element: Element | null) {
	return isTypeableElement(element);
}

function useClick(
	context: FloatingContext,
	options: UseClickOptions = {},
): ElementProps {
	const {
		enabled = true,
		event: eventOption = "click",
		toggle = true,
		ignoreMouse = false,
		keyboardHandlers = true,
	} = $derived(options);

	let pointerType: PointerEvent["pointerType"] | undefined = undefined;
	let didKeyDown = false;

	return {
		get reference() {
			if (!enabled) {
				return {};
			}
			return {
				onpointerdown: (event: PointerEvent) => {
					pointerType = event.pointerType;
				},
				onmousedown: (event: MouseEvent) => {
					if (event.button !== 0) {
						return;
					}

					if (isMouseLikePointerType(pointerType, true) && ignoreMouse) {
						return;
					}

					if (eventOption === "click") {
						return;
					}

					if (
						context.open &&
						toggle &&
						(context.data.openEvent
							? context.data.openEvent.type === "mousedown"
							: true)
					) {
						context.onOpenChange(false, event, "click");
					} else {
						// Prevent stealing focus from the floating element
						event.preventDefault();
						context.onOpenChange(true, event, "click");
					}
				},
				onclick: (event: MouseEvent) => {
					if (eventOption === "mousedown" && pointerType) {
						pointerType = undefined;
						return;
					}

					if (isMouseLikePointerType(pointerType, true) && ignoreMouse) {
						return;
					}

					if (
						context.open &&
						toggle &&
						(context.data.openEvent
							? context.data.openEvent.type === "click"
							: true)
					) {
						context.onOpenChange(false, event, "click");
					} else {
						context.onOpenChange(true, event, "click");
					}
				},
				onkeydown: (event: KeyboardEvent) => {
					pointerType = undefined;

					if (
						event.defaultPrevented ||
						!keyboardHandlers ||
						isButtonTarget(event)
					) {
						return;
					}
					// @ts-expect-error FIXME
					if (event.key === " " && !isSpaceIgnored(reference)) {
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
				},
				onkeyup: (event: KeyboardEvent) => {
					if (
						event.defaultPrevented ||
						!keyboardHandlers ||
						isButtonTarget(event) ||
						// @ts-expect-error FIXME
						isSpaceIgnored(reference)
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
				},
			};
		},
	};
}

export type { UseClickOptions };
export { useClick };
