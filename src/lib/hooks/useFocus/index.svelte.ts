import { getWindow, isElement, isHTMLElement } from '@floating-ui/utils/dom';
import type { FloatingContext } from '../useFloating/index.svelte.js';
import type { OpenChangeReason } from '$lib/types.js';
import { isTypeableElement } from '$lib/utils/is-typable-element.js';
import {
	activeElement,
	getDocument,
	isVirtualPointerEvent,
	getTarget,
	createAttribute,
	contains,
} from '$lib/utils/dom.js';
import { isSafari, isMac } from '$lib/utils/environment.js';

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

function useFocus(context: FloatingContext, options: UseFocusOptions = {}) {
	const {
		open,
		onOpenChange,
		events,
		elements: { reference, floating },
	} = $derived(context);

	const { enabled = true, visibleOnly = true } = $derived(options);

	let blockFocus = false;
	let timeout = -1;
	let keyboardModality = true;

	$effect(() => {
		if (!enabled) {
			return;
		}

		const win = getWindow(reference);

		// If the reference was focused and the user left the tab/window, and the
		// floating element was not open, the focus should be blocked when they
		// return to the tab/window.
		function onBlur() {
			if (
				!open &&
				isHTMLElement(reference) &&
				reference === activeElement(getDocument(reference))
			) {
				blockFocus = true;
			}
		}

		function onKeyDown() {
			keyboardModality = true;
		}

		win.addEventListener('blur', onBlur);
		win.addEventListener('keydown', onKeyDown, true);
		return () => {
			win.removeEventListener('blur', onBlur);
			win.removeEventListener('keydown', onKeyDown, true);
		};
	});

	$effect(() => {
		if (!enabled) {
			return;
		}

		function onOpenChange({ reason }: { reason: OpenChangeReason }) {
			if (reason === 'reference-press' || reason === 'escape-key') {
				blockFocus = true;
			}
		}

		events.on('openchange', onOpenChange);
		return () => {
			events.off('openchange', onOpenChange);
		};
	});

	$effect(() => {
		return () => {
			clearTimeout(timeout);
		};
	});

	return {
		get reference() {
			if (!enabled) {
				return {};
			}
			return {
				onpointerdown: (event: PointerEvent) => {
					if (isVirtualPointerEvent(event)) return;
					keyboardModality = false;
				},
				onmouseleave() {
					blockFocus = false;
				},
				onfocus: (event: FocusEvent) => {
					if (blockFocus) {
						return;
					}

					const target = getTarget(event);

					if (visibleOnly && isElement(target)) {
						try {
							// Mac Safari unreliably matches `:focus-visible` on the reference
							// if focus was outside the page initially - use the fallback
							// instead.
							// if (isSafari() && isMac()) throw Error();
							if (!target.matches(':focus-visible')) return;
						} catch {
							// Old browsers will throw an error when using `:focus-visible`.
							if (!keyboardModality && !isTypeableElement(target)) {
								return;
							}
						}
					}

					onOpenChange(true, event, 'focus');
				},
				onblur: (event: FocusEvent) => {
					blockFocus = false;
					const relatedTarget = event.relatedTarget;

					// Hit the non-modal focus management portal guard. Focus will be
					// moved into the floating element immediately after.
					const movedToFocusGuard =
						isElement(relatedTarget) &&
						relatedTarget.hasAttribute(createAttribute('focus-guard')) &&
						relatedTarget.getAttribute('data-type') === 'outside';

					// Wait for the window blur listener to fire.
					timeout = window.setTimeout(() => {
						// @ts-expect-error - FIXME
						const activeEl = activeElement(reference ? reference.ownerDocument : document);

						// Focus left the page, keep it open.
						if (!relatedTarget && activeEl === reference) return;

						// When focusing the reference element (e.g. regular click), then
						// clicking into the floating element, prevent it from hiding.
						// Note: it must be focusable, e.g. `tabindex="-1"`.
						// We can not rely on relatedTarget to point to the correct element
						// as it will only point to the shadow host of the newly focused element
						// and not the element that actually has received focus if it is located
						// inside a shadow root.
						if (
							contains(floating, activeEl) ||
							// @ts-expect-error - FIXME
							contains(reference, activeEl) ||
							movedToFocusGuard
						) {
							return;
						}

						onOpenChange(false, event, 'focus');
					});
				},
			};
		},
	};
}

export { useFocus, type UseFocusOptions };
