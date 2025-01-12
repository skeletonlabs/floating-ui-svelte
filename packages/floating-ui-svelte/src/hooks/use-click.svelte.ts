import { isHTMLElement } from "@floating-ui/utils/dom";
import { isMouseLikePointerType, isPointerType } from "../internal/dom.js";
import { isTypeableElement } from "../internal/is-typeable-element.js";
import type { FloatingContext } from "./use-floating.svelte.js";
import type { MaybeGetter, ReferenceType } from "../types.js";
import { extract } from "../internal/extract.js";
import type { ElementProps } from "./use-interactions.svelte.js";

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

class ClickInteraction implements ElementProps {
	#enabled = $derived.by(() => extract(this.options?.enabled, true));
	#eventOption = $derived.by(() => extract(this.options?.event, "click"));
	#toggle = $derived.by(() => extract(this.options?.toggle, true));
	#ignoreMouse = $derived.by(() => extract(this.options?.ignoreMouse, false));
	#stickIfOpen = $derived.by(() => extract(this.options?.stickIfOpen, true));
	#keyboardHandlers = $derived.by(() =>
		extract(this.options?.keyboardHandlers, true),
	);
	#pointerType: PointerType | undefined = undefined;
	#didKeyDown = false;

	constructor(
		private readonly context: FloatingContext,
		private readonly options: UseClickOptions = {},
	) {}

	#onpointerdown = (event: PointerEvent) => {
		if (!isPointerType(event.pointerType)) return;
		this.#pointerType = event.pointerType;
	};

	#onmousedown = (event: MouseEvent) => {
		// Ignore all buttons except for the "main" button.
		// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
		if (event.button !== 0) return;
		if (this.#eventOption === "click") return;
		if (isMouseLikePointerType(this.#pointerType, true) && this.#ignoreMouse) {
			return;
		}

		if (
			this.context.open &&
			this.#toggle &&
			(this.context.data.openEvent && this.#stickIfOpen
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
			(this.context.data.openEvent && this.#stickIfOpen
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

		if (event.key === " " && !isSpaceIgnored(this.context.domReference)) {
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
			isSpaceIgnored(this.context.domReference)
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

	get reference() {
		return this.#reference;
	}

	#reference = $derived.by(() => {
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
	return new ClickInteraction(context, options);
}

export type { UseClickOptions };
export { useClick };
