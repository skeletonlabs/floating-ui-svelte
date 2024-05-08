import { it } from 'vitest';

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

/**
 * Run a test in Svelte effect context
 * @deprecated Use `withEffect` instead
 */
export function testInEffect(name: string, fn: () => void) {
	it(name, async () => {
		let promise;
		const cleanup = $effect.root(() => (promise = fn()));
		try {
			await promise;
		} finally {
			cleanup();
		}
	});
}
