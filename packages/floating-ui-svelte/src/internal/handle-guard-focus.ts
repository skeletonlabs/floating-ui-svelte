import { sleep } from "./sleep.js";

/**
 * Guards have an `aria-hidden` attribute on them, as they should not be visible to screen readers,
 * however, they are used as an intermediary to focus the real target. When they receive focus in
 * chromium browsers, an error is logged informing that an `aria-hidden` element should not be
 * focused.
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
	sleep().then(() => {
		if (ariaHidden === null) {
			guard.setAttribute("aria-hidden", "");
		} else {
			guard.setAttribute("aria-hidden", ariaHidden);
		}
	});
}

export { handleGuardFocus };
