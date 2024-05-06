import { it } from 'vitest';

/**
 * Run a test in Svelte effect context
 */
export function it_in_effect(name: string, fn: () => void) {
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
