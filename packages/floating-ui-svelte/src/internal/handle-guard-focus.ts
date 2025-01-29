import { afterSleep } from "./after-sleep.js";

/**
 *
 * We apply the `aria-hidden` attribute to elements that should not be visible to screen readers
 * under specific circumstances, mostly when in a "modal" context or when they are strictly for
 * utility purposes, like the focus guards.
 *
 * When these elements receive focus before we can remove the aria-hidden attribute, we need to
 * handle the focus in a way that does not cause an error to be logged.
 *
 * This function handles the focus of the guard element first by momentary removing the
 * `aria-hidden` attribute, focusing the guard (which will cause something else to focus), and then
 * restoring the attribute.
 */
function handleGuardFocus(
	guard: HTMLElement | null,
	focusOptions?: Parameters<HTMLElement["focus"]>[0],
) {
	if (!guard) return;
	const ariaHidden = guard.getAttribute("aria-hidden");
	guard.removeAttribute("aria-hidden");
	guard.focus(focusOptions);
	afterSleep(0, () => {
		if (ariaHidden === null) {
			guard.setAttribute("aria-hidden", "");
		} else {
			guard.setAttribute("aria-hidden", ariaHidden);
		}
	});
}

export { handleGuardFocus };
