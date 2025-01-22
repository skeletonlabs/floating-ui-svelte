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
import type { MaybeGetter, OpenChangeReason } from "../types.js";
import type { FloatingContext } from "./use-floating.svelte.js";
import { on } from "svelte/events";
import { executeCallbacks } from "../internal/execute-callbacks.js";
import { extract } from "../internal/extract.js";
import { watch } from "../internal/watch.svelte.js";
import type { ElementProps } from "./use-interactions.svelte.js";

interface UseFocusOptions {
	/**
	 * Whether the Hook is enabled, including all internal Effects and event
	 * handlers.
	 * @default true
	 */
	enabled?: MaybeGetter<boolean>;
	/**
	 * Whether the open state only changes if the focus event is considered
	 * visible (`:focus-visible` CSS selector).
	 * @default true
	 */
	visibleOnly?: MaybeGetter<boolean>;
}

function useFocus(context: FloatingContext, opts: UseFocusOptions = {}) {
	const enabled = $derived(extract(opts.enabled, true));
	const visibleOnly = $derived(extract(opts.visibleOnly, true));
	let blockFocus = false;
	let timeout = -1;
	let keyboardModality = true;

	function onpointerdown(event: PointerEvent) {
		if (isVirtualPointerEvent(event)) return;
		keyboardModality = false;
	}

	function onmouseleave() {
		blockFocus = false;
	}

	function onfocus(event: FocusEvent) {
		if (blockFocus) {
			return;
		}

		const target = getTarget(event);

		if (visibleOnly && isElement(target)) {
			try {
				// Mac Safari unreliably matches `:focus-visible` on the reference
				// if focus was outside the page initially - use the fallback
				// instead.
				if (isSafari() && isMac()) throw Error();
				if (!target.matches(":focus-visible")) return;
			} catch {
				// Old browsers will throw an error when using `:focus-visible`.
				if (!keyboardModality && !isTypeableElement(target)) {
					return;
				}
			}
		}

		context.onOpenChange(true, event, "focus");
	}

	function onblur(event: FocusEvent) {
		blockFocus = false;
		const relatedTarget = event.relatedTarget;

		// Hit the non-modal focus management portal guard. Focus will be
		// moved into the floating element immediately after.
		const movedToFocusGuard =
			isElement(relatedTarget) &&
			relatedTarget.hasAttribute(createAttribute("focus-guard")) &&
			relatedTarget.getAttribute("data-type") === "outside";

		// Wait for the window blur listener to fire.
		timeout = window.setTimeout(() => {
			const activeEl = activeElement(
				isElement(context.domReference)
					? context.domReference.ownerDocument
					: document,
			);

			// Focus left the page, keep it open.
			if (!relatedTarget && activeEl === context.domReference) return;

			// When focusing the reference element (e.g. regular click), then
			// clicking into the floating element, prevent it from hiding.
			// Note: it must be focusable, e.g. `tabindex="-1"`.
			// We can not rely on relatedTarget to point to the correct element
			// as it will only point to the shadow host of the newly focused element
			// and not the element that actually has received focus if it is located
			// inside a shadow root.
			if (
				contains(context.floating, activeEl) ||
				contains(context.domReference, activeEl) ||
				movedToFocusGuard
			) {
				return;
			}

			context.onOpenChange(false, event, "focus");
		});
	}

	watch(
		[() => enabled, () => context.domReference],
		([enabled, domReference]) => {
			if (!enabled) return;

			const win = getWindow(domReference);

			// If the domReference was focused and the user left the tab/window, and the
			// floating element was not open, the focus should be blocked when they
			// return to the tab/window.
			const onBlur = () => {
				if (
					!context.open &&
					isHTMLElement(domReference) &&
					domReference === activeElement(getDocument(domReference))
				) {
					blockFocus = true;
				}
			};

			const onKeyDown = () => {
				keyboardModality = true;
			};

			return executeCallbacks(
				on(win, "blur", onBlur),
				on(win, "keydown", onKeyDown, { capture: true }),
			);
		},
	);

	watch(
		() => enabled,
		(enabled) => {
			if (!enabled) return;

			const onOpenChange = ({ reason }: { reason: OpenChangeReason }) => {
				if (reason === "reference-press" || reason === "escape-key") {
					blockFocus = true;
				}
			};

			context.events.on("openchange", onOpenChange);
			return () => {
				context.events.off("openchange", onOpenChange);
			};
		},
	);

	$effect(() => {
		return () => {
			window.clearTimeout(timeout);
		};
	});

	const reference = $derived({
		onpointerdown: onpointerdown,
		onmouseleave: onmouseleave,
		onfocus: onfocus,
		onblur: onblur,
	});

	return {
		get reference() {
			if (!enabled) return {};
			return reference;
		},
	};
}

export type { UseFocusOptions };
export { useFocus };
