/**
 * A utility function that executes a callback after a specified number of milliseconds.
 */
function afterSleep(ms: number, cb: () => void) {
	return setTimeout(cb, ms);
}

export { afterSleep };
