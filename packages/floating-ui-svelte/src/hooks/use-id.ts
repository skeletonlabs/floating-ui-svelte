let count = 0;

function useId() {
	return Math.random().toString(36).substring(2, 9) + count++;
}

export { useId };
