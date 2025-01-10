import { isHTMLElement } from "@floating-ui/utils/dom";
import { isMouseLikePointerType } from "../internal/dom.js";
import { isTypeableElement } from "../internal/is-typeable-element.js";
import type { FloatingContext } from "./use-floating.svelte.js";
import type { ReferenceType } from "../types.js";

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

function isSpaceIgnored(element: ReferenceType | null) {
	return isTypeableElement(element);
}

class ClickState {
	#enabled = $derived.by(() => this.options.enabled ?? "true");
	#eventOption = $derived.by(() => this.options.event ?? "click");
	#toggle = $derived.by(() => this.options.toggle ?? true);
	#ignoreMouse = $derived.by(() => this.options.ignoreMouse ?? false);
	#keyboardHandlers = $derived.by(() => this.options.keyboardHandlers ?? true);
	#pointerType: PointerEvent["pointerType"] | undefined = undefined;
	#didKeyDown = false;

	constructor(
		private readonly context: FloatingContext,
		private readonly options: UseClickOptions = {},
	) {}

	#onmousedown = (event: MouseEvent) => {
		if (event.button !== 0) return;
		if (isMouseLikePointerType(this.#pointerType, true) && this.#ignoreMouse) {
			return;
		}

		if (this.#eventOption === "click") return;

		if (
			this.context.open &&
			this.#toggle &&
			(this.context.data.openEvent
				? this.context.data.openEvent.type === "mousedown"
				: true)
		) {
			this.context.onOpenChange(false, event, "click");
		} else {
			// Prevent stealing focus from the floating element
			event.preventDefault();
			this.context.onOpenChange(true, event, "click");
		}
	};

	#onpointerdown = (event: PointerEvent) => {
		this.#pointerType = event.pointerType;
	};

	#onclick = (event: MouseEvent) => {
		if (this.#eventOption === "mousedown" && this.#pointerType) {
			this.#pointerType = undefined;
			return;
		}

		if (isMouseLikePointerType(this.#pointerType, true) && this.#ignoreMouse) {
			return;
		}

		if (
			this.context.open &&
			this.#toggle &&
			(this.context.data.openEvent
				? this.context.data.openEvent.type === "click"
				: true)
		) {
			this.context.onOpenChange(false, event, "click");
		} else {
			this.context.onOpenChange(true, event, "click");
		}
	};

	#onkeydown = (event: KeyboardEvent) => {
		this.#pointerType = undefined;

		if (
			event.defaultPrevented ||
			!this.#keyboardHandlers ||
			isButtonTarget(event)
		) {
			return;
		}

		if (
			event.key === " " &&
			!isSpaceIgnored(this.context.elements.domReference)
		) {
			// Prevent scrolling
			event.preventDefault();
			this.#didKeyDown = true;
		}

		if (event.key === "Enter") {
			if (this.context.open && this.#toggle) {
				this.context.onOpenChange(false, event, "click");
			} else {
				this.context.onOpenChange(true, event, "click");
			}
		}
	};

	#onkeyup = (event: KeyboardEvent) => {
		if (
			event.defaultPrevented ||
			!this.#keyboardHandlers ||
			isButtonTarget(event) ||
			isSpaceIgnored(this.context.elements.domReference)
		) {
			return;
		}

		if (event.key === " " && this.#didKeyDown) {
			this.#didKeyDown = false;
			if (this.context.open && this.#toggle) {
				this.context.onOpenChange(false, event, "click");
			} else {
				this.context.onOpenChange(true, event, "click");
			}
		}
	};

	readonly reference = $derived.by(() => {
		if (!this.#enabled) return {};
		return {
			onpointerdown: this.#onpointerdown,
			onmousedown: this.#onmousedown,
			onclick: this.#onclick,
			onkeydown: this.#onkeydown,
			onkeyup: this.#onkeyup,
		};
	});
}

function useClick(context: FloatingContext, options: UseClickOptions = {}) {
	return new ClickState(context, options);
}

export type { UseClickOptions };
export { useClick };
