let count = 0;

/**
 * Generates a unique id.
 */
function useId() {
	return Math.random().toString(36).substr(2, 9) + count++;
}

export { useId };
