function withRunes(fn: () => void) {
	return async () => {
		let promise: unknown;
		const cleanup = $effect.root(() => {
			promise = fn();
		});
		try {
			return await promise;
		} finally {
			cleanup();
		}
	};
}

export { withRunes };
