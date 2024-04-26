import { it } from 'vitest';

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

export async function sleep(ms: number) {
	return new Promise((res) => setTimeout(res, ms));
}
