import { getWindow, isElement, isHTMLElement } from "@floating-ui/utils/dom";
import {
	activeElement,
	contains,
	createAttribute,
	getDocument,
	getTarget,
	isVirtualPointerEvent,
} from "../internal/dom.js";
import { isMac, isSafari } from "../internal/environment.js";
import { isTypeableElement } from "../internal/is-typeable-element.js";
import type { OpenChangeReason } from "../types.js";
import type { FloatingContext } from "./use-floating.svelte.js";
import { on } from "svelte/events";
import { executeCallbacks } from "../internal/execute-callbacks.js";

interface UseFocusOptions {
	/**
	 * Whether the Hook is enabled, including all internal Effects and event
	 * handlers.
	 * @default true
	 */
	enabled?: boolean;
	/**
	 * Whether the open state only changes if the focus event is considered
	 * visible (`:focus-visible` CSS selector).
	 * @default true
	 */
	visibleOnly?: boolean;
}

class FocusInteraction {
	#enabled = $derived.by(() => this.options.enabled ?? true);
	#visibleOnly = $derived.by(() => this.options.visibleOnly ?? true);
	#blockFocus = false;
	#timeout = -1;
	#keyboardModality = true;

	constructor(
		private readonly context: FloatingContext,
		private readonly options: UseFocusOptions = {},
	) {
		$effect(() => {
			if (!this.#enabled) return;

			const win = getWindow(this.context.elements.domReference);

			// If the domReference was focused and the user left the tab/window, and the
			// floating element was not open, the focus should be blocked when they
			// return to the tab/window.
			const onBlur = () => {
				if (
					!open &&
					isHTMLElement(context.elements.domReference) &&
					context.elements.domReference ===
						activeElement(getDocument(context.elements.domReference))
				) {
					this.#blockFocus = true;
				}
			};

			const onKeyDown = () => {
				this.#keyboardModality = true;
			};

			return executeCallbacks(
				on(win, "blur", onBlur),
				on(win, "keydown", onKeyDown, { capture: true }),
			);
		});

		$effect(() => {
			if (!this.#enabled) return;

			const onOpenChange = ({ reason }: { reason: OpenChangeReason }) => {
				if (reason === "reference-press" || reason === "escape-key") {
					this.#blockFocus = true;
				}
			};

			this.context.events.on("openchange", onOpenChange);
			return () => {
				this.context.events.off("openchange", onOpenChange);
			};
		});

		$effect(() => {
			return () => {
				clearTimeout(this.#timeout);
			};
		});
	}

	#onpointerdown = (event: PointerEvent) => {
		if (isVirtualPointerEvent(event)) return;
		this.#keyboardModality = false;
	};

	#onmouseleave = () => {
		this.#blockFocus = false;
	};

	#onfocus = (event: FocusEvent) => {
		if (this.#blockFocus) {
			return;
		}

		const target = getTarget(event);

		if (this.#visibleOnly && isElement(target)) {
			try {
				// Mac Safari unreliably matches `:focus-visible` on the reference
				// if focus was outside the page initially - use the fallback
				// instead.
				if (isSafari() && isMac()) throw Error();
				if (!target.matches(":focus-visible")) return;
			} catch {
				// Old browsers will throw an error when using `:focus-visible`.
				if (!this.#keyboardModality && !isTypeableElement(target)) {
					return;
				}
			}
		}

		this.context.onOpenChange(true, event, "focus");
	};

	#onblur = (event: FocusEvent) => {
		this.#blockFocus = false;
		const relatedTarget = event.relatedTarget;

		// Hit the non-modal focus management portal guard. Focus will be
		// moved into the floating element immediately after.
		const movedToFocusGuard =
			isElement(relatedTarget) &&
			relatedTarget.hasAttribute(createAttribute("focus-guard")) &&
			relatedTarget.getAttribute("data-type") === "outside";

		// Wait for the window blur listener to fire.
		this.#timeout = window.setTimeout(() => {
			const activeEl = activeElement(
				isElement(this.context.elements.domReference)
					? this.context.elements.domReference.ownerDocument
					: document,
			);

			// Focus left the page, keep it open.
			if (!relatedTarget && activeEl === this.context.elements.domReference)
				return;

			// When focusing the reference element (e.g. regular click), then
			// clicking into the floating element, prevent it from hiding.
			// Note: it must be focusable, e.g. `tabindex="-1"`.
			// We can not rely on relatedTarget to point to the correct element
			// as it will only point to the shadow host of the newly focused element
			// and not the element that actually has received focus if it is located
			// inside a shadow root.
			if (
				contains(this.context.elements.floating, activeEl) ||
				contains(this.context.elements.domReference, activeEl) ||
				movedToFocusGuard
			) {
				return;
			}

			this.context.onOpenChange(false, event, "focus");
		});
	};

	readonly reference = $derived.by(() => {
		if (!this.#enabled) return {};
		return {
			onpointerdown: this.#onpointerdown,
			onmouseleave: this.#onmouseleave,
			onfocus: this.#onfocus,
			onblur: this.#onblur,
		};
	});

	get enabled() {
		return this.#enabled;
	}
}

function useFocus(context: FloatingContext, options: UseFocusOptions = {}) {
	return new FocusInteraction(context, options);
}

export type { UseFocusOptions };
export { useFocus, FocusInteraction as FocusState };
