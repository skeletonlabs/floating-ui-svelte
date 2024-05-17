/**
 * Run a function inside Svelte's effect context
 */
export function withEffect(fn: () => void) {
	return async () => {
		let promise;
		const cleanup = $effect.root(() => (promise = fn()));
		try {
			return await promise;
		} finally {
			cleanup();
		}
	};
}
