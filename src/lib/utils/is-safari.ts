/**
 * Check if the browser is Safari.
 */
export function isSafari() {
	// Chrome DevTools does not complain about navigator.vendor
	return /apple/i.test(navigator.vendor);
}
