import { describe, expect, it } from 'vitest';
import { it_in_effect, sleep } from './util.svelte.js';
import {
	offset,
	useFloating,
	autoUpdate,
	type Placement,
	type Middleware,
	type UseFloatingOptions,
	Strategy
} from '../src/lib/index.js';
import { tick } from 'svelte';

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
	it_in_effect('updates floating coordinates on middleware change', async () => {
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
	it_in_effect('updates floating coordinates on placement change', async () => {
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
	it_in_effect('updates `floatingStyles` on strategy change', async () => {
		let strategy: Strategy = $state('absolute');

		const { floatingStyles } = useFloating({
			...test_config(),
			get strategy() {
				return strategy;
			}
		});

		// Give time for FloatingUI to calculate the new position
		await sleep(100);

		expect(floatingStyles.value).toContain('position: absolute');

		strategy = 'fixed';

		// Give time for FloatingUI to calculate the new position
		await sleep(100);

		expect(floatingStyles.value).toContain('position: fixed');
	});
	it_in_effect('updates `isPositioned` when position is computed', async () => {
		const { x, y, isPositioned } = useFloating({
			...test_config(),
			middleware: [offset(5)]
		});

		expect(x.value).toBe(0);
		expect(y.value).toBe(0);
		expect(isPositioned.value).toBe(false);

		// Give time for FloatingUI to calculate the new position
		await sleep(100);

		expect(x.value).toBe(0);
		expect(y.value).toBe(5);
		expect(isPositioned.value).toBe(true);
	});

	it_in_effect('updates `isPositioned` to `false` when `open` is set to false', async () => {
		let open = $state(true);

		const { isPositioned } = useFloating({
			...test_config(),
			get open() {
				return open;
			}
		});

		expect(isPositioned.value).toBe(false);

		// Give time for FloatingUI to calculate the new position
		await sleep(100);

		expect(isPositioned.value).toBe(true);

		open = false;

		// Let Svelte flush all updates
		await tick();

		expect(isPositioned.value).toBe(false);
	});
	// TODO: Test all props fallback to default values when reactively set to `undefined`
});
