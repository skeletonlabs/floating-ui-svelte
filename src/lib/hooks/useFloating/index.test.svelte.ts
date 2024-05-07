import { describe, expect, vi, it } from 'vitest';
import { it_in_effect } from '$lib/test-utils.svelte.js';
import {
	offset,
	useFloating,
	autoUpdate,
	type Placement,
	type Middleware,
	type UseFloatingOptions,
	type Strategy
} from '../../index.js';

describe('useFloating', () => {
	function test_config(): UseFloatingOptions {
		return {
			elements: {
				reference: document.createElement('div'),
				floating: document.createElement('div')
			},
			whileElementsMounted: autoUpdate
		};
	}
	it_in_effect('updates floating coordinates on `middleware` change', async () => {
		const middleware: Middleware[] = $state([]);

		const floating = useFloating({
			...test_config(),
			get middleware() {
				return middleware;
			}
		});

		await vi.waitFor(() => {
			expect(floating.x).toBe(0);
			expect(floating.y).toBe(0);
		});

		middleware.push(offset(5));

		await vi.waitFor(() => {
			expect(floating.x).toBe(0);
			expect(floating.y).toBe(5);
		});
	});
	it_in_effect('updates floating coordinates on `placement` change', async () => {
		let placement: Placement = $state('bottom');

		const floating = useFloating({
			...test_config(),
			middleware: [offset(5)],
			get placement() {
				return placement;
			}
		});

		await vi.waitFor(() => {
			expect(floating.x).toBe(0);
			expect(floating.y).toBe(5);
		});

		placement = 'right';

		await vi.waitFor(() => {
			expect(floating.x).toBe(5);
			expect(floating.y).toBe(0);
		});
	});
	it_in_effect('updates `floatingStyles` on `strategy` change', async () => {
		let strategy: Strategy = $state('absolute');

		const floating = useFloating({
			...test_config(),
			get strategy() {
				return strategy;
			}
		});

		await vi.waitFor(() => {
			expect(floating.floatingStyles).toContain('position: absolute');
		});

		strategy = 'fixed';

		await vi.waitFor(() => {
			expect(floating.floatingStyles).toContain('position: fixed');
		});
	});
	it_in_effect('updates `floatingStyles` on `transform` change', async () => {
		let transform = $state(false);

		const floating = useFloating({
			...test_config(),
			get transform() {
				return transform;
			}
		});

		await vi.waitFor(() => {
			expect(floating.floatingStyles).not.toContain('transform: translate(0px, 0px)');
		});

		transform = true;

		await vi.waitFor(() => {
			expect(floating.floatingStyles).toContain('transform: translate(0px, 0px)');
		});
	});
	it_in_effect('updates `isPositioned` when position is computed', async () => {
		const floating = useFloating({
			...test_config(),
			middleware: [offset(5)]
		});

		expect(floating.x).toBe(0);
		expect(floating.y).toBe(0);
		expect(floating.isPositioned).toBe(false);

		await vi.waitFor(() => {
			expect(floating.x).toBe(0);
			expect(floating.y).toBe(5);
			expect(floating.isPositioned).toBe(true);
		});
	});
	it_in_effect('updates `isPositioned` to `false` when `open` is set to `false`', async () => {
		let open = $state(true);

		const floating = useFloating({
			...test_config(),
			get open() {
				return open;
			}
		});

		expect(floating.isPositioned).toBe(false);

		await vi.waitFor(() => {
			expect(floating.isPositioned).toBe(true);
		});

		open = false;

		await vi.waitFor(() => {
			expect(floating.isPositioned).toBe(false);
		});
	});
	it_in_effect(
		'fallbacks to default (`bottom`) when `placement` is set to `undefined`',
		async () => {
			let placement: Placement | undefined = $state('top');

			const floating = useFloating({
				...test_config(),
				middleware: [offset(5)],
				get placement() {
					return placement;
				}
			});

			await vi.waitFor(() => {
				expect(floating.x).toBe(0);
				expect(floating.y).toBe(-5);
			});

			placement = undefined;

			await vi.waitFor(() => {
				expect(floating.x).toBe(0);
				expect(floating.y).toBe(5);
			});
		}
	);
	it_in_effect(
		'fallbacks to default (`absolute`) when `strategy` is set to `undefined`',
		async () => {
			let strategy: Strategy | undefined = $state('fixed');

			const floating = useFloating({
				...test_config(),
				get strategy() {
					return strategy;
				}
			});

			await vi.waitFor(() => {
				expect(floating.floatingStyles).toContain('position: fixed');
			});

			strategy = undefined;

			await vi.waitFor(() => {
				expect(floating.floatingStyles).toContain('position: absolute');
			});
		}
	);
	it_in_effect('fallbacks to default (`true`) when `transform` is set to `undefined`', async () => {
		let transform: boolean | undefined = $state(false);

		const floating = useFloating({
			...test_config(),
			get transform() {
				return transform;
			}
		});

		await vi.waitFor(() => {
			expect(floating.floatingStyles).not.toContain('transform: translate(0px, 0px)');
		});

		transform = undefined;

		await vi.waitFor(() => {
			expect(floating.floatingStyles).toContain('transform: translate(0px, 0px)');
		});
	});
	it_in_effect('fallbacks to default ({}) when `elements` is set to `undefined`', async () => {
		let elements: UseFloatingOptions['elements'] | undefined = $state({
			reference: document.createElement('div'),
			floating: document.createElement('div')
		});

		const floating = useFloating({
			...test_config(),
			get elements() {
				return elements;
			}
		});

		await vi.waitFor(() => {
			expect(floating.elements).toEqual(elements);
		});

		elements = undefined;

		await vi.waitFor(() => {
			expect(floating.elements).toEqual({});
		});
	});
	it_in_effect(
		'calls `whileElementsMounted` when `reference` and `floating` are mounted',
		async () => {
			const whileElementsMounted = vi.fn();

			useFloating({
				elements: {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				},
				whileElementsMounted
			});

			expect(whileElementsMounted).toHaveBeenCalledTimes(1);
		}
	);
	it_in_effect(
		'calls `whileElementsMounted` with `floating`, `reference` and `update` as args',
		async () => {
			const whileElementsMounted = vi.fn();

			useFloating({
				elements: {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				},
				whileElementsMounted
			});

			const [reference, floating, update] = whileElementsMounted.mock.calls[0];

			expect(reference).toBeInstanceOf(HTMLElement);
			expect(floating).toBeInstanceOf(HTMLElement);
			expect(update).toBeTypeOf('function');
		}
	);
	it('calls `whileElementsMounted` cleanup callback on unmount', async () => {
		const whileElementsMountedCleanup = vi.fn();

		const cleanup = $effect.root(() => {
			useFloating({
				elements: {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				},
				whileElementsMounted: () => whileElementsMountedCleanup
			});
		});

		expect(whileElementsMountedCleanup).toHaveBeenCalledTimes(0);

		cleanup();

		expect(whileElementsMountedCleanup).toHaveBeenCalledTimes(1);
	});
	it_in_effect('correctly assigns `middlewareData` from `middleware`', async () => {
		const floating = useFloating({
			...test_config(),
			middleware: [
				{
					name: 'test',
					fn: () => ({ data: { content: 'Content' } })
				}
			]
		});

		await vi.waitFor(() => {
			expect(floating.middlewareData).toEqual({ test: { content: 'Content' } });
		});
	});
	it_in_effect('allows elements to be defined upstream', async () => {
		const floating = useFloating();

		await vi.waitFor(() => {
			expect(floating.elements.reference).toBeUndefined();
			expect(floating.elements.floating).toBeUndefined();
		});

		floating.elements.reference = document.createElement('div');

		await vi.waitFor(() => {
			expect(floating.elements.reference).toBeInstanceOf(HTMLElement);
		});

		floating.elements.floating = document.createElement('div');

		await vi.waitFor(() => {
			expect(floating.elements.floating).toBeInstanceOf(HTMLElement);
		});
	});
});
