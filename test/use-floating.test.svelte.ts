import { describe, expect } from 'vitest';
import { it_in_effect, sleep } from './util.svelte.js';
import {
	offset,
	useFloating,
	autoUpdate,
	type Placement,
	type Middleware,
	type UseFloatingOptions
} from '../src/lib/index.js';

describe('useFloating', () => {
	function test_config(): Partial<UseFloatingOptions> {
		return {
			elements: {
				reference: document.createElement('div'),
				floating: document.createElement('div')
			},
			whileElementsMounted: autoUpdate
		};
	}
	it_in_effect('updates floating coords on middleware change', async () => {
		const middleware: Middleware[] = $state([]);

		const { x, y } = useFloating({
			...test_config(),
			get middleware() {
				return middleware;
			}
		});

		// Give time for FloatingUI to calculate the new position
		await sleep(100);

		expect(x.value).toBe(0);
		expect(y.value).toBe(0);

		middleware.push(offset(5));

		// Give time for FloatingUI to calculate the new position
		await sleep(100);

		expect(x.value).toBe(0);
		expect(y.value).toBe(5);
	});
	it_in_effect('updates floating coords on placement change', async () => {
		let placement: Placement = $state('bottom');

		const { x, y } = useFloating({
			...test_config(),
			middleware: [offset(5)],
			get placement() {
				return placement;
			}
		});

		// Give time for FloatingUI to calculate the new position
		await sleep(100);

		expect(x.value).toBe(0);
		expect(y.value).toBe(5);

		placement = 'top';

		// Give time for FloatingUI to calculate the new position
		await sleep(100);

		expect(x.value).toBe(0);
		expect(y.value).toBe(-5);
	});
});
