import { describe, expect, expectTypeOf, vi } from 'vitest';
import { testInEffect } from '$lib/test-utils.svelte.js';
import { useFloating, type FloatingContext } from './index.svelte.js';
import {
	offset,
	type Middleware,
	type MiddlewareData,
	type Placement,
	type Strategy
} from '@floating-ui/dom';

describe('useFloating', () => {
	describe('elements', () => {
		testInEffect('elements can be set', () => {
			const elements = {
				reference: document.createElement('div'),
				floating: document.createElement('div')
			};

			const floating = useFloating({ elements });

			expect(floating.elements).toEqual(elements);
		});
		testInEffect('elements can be set through return value', () => {
			const elements = {
				reference: document.createElement('div'),
				floating: document.createElement('div')
			};

			const floating = useFloating();

			floating.elements.reference = elements.reference;
			floating.elements.floating = elements.floating;

			expect(floating.elements).toEqual(elements);
		});
		testInEffect('elements is returned', () => {
			const floating = useFloating();
			expect(floating).toHaveProperty('elements');
		});
		testInEffect('elements is an object', () => {
			const floating = useFloating();
			expect(floating.elements).toBeTypeOf('object');
		});
		testInEffect('elements defaults to {}', () => {
			const floating = useFloating();
			expect(floating.elements).toEqual({});
		});
		testInEffect('elements is reactive', async () => {
			let elements: { reference: HTMLElement; floating: HTMLElement } = $state({
				reference: document.createElement('div'),
				floating: document.createElement('div')
			});

			const floating = useFloating({
				get elements() {
					return elements;
				}
			});

			expect(floating.elements).toEqual(elements);

			elements = {
				reference: document.createElement('span'),
				floating: document.createElement('span')
			};

			await vi.waitFor(() => {
				expect(floating.elements).toEqual(elements);
			});
		});
	});

	describe('transform', () => {
		testInEffect('transform can be set', async () => {
			const transform = true;
			const floating = useFloating({
				elements: {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				},
				transform
			});

			await vi.waitFor(() => {
				expect(floating.floatingStyles).contain('transform: translate(0px, 0px)');
			});
		});
		testInEffect('transform defaults to "true"', async () => {
			const floating = useFloating({
				elements: {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				}
			});
			await vi.waitFor(() => {
				expect(floating.floatingStyles).contain('transform: translate(0px, 0px)');
			});
		});
		testInEffect('transform is reactive', async () => {
			let transform = $state(true);
			const floating = useFloating({
				elements: {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				},
				get transform() {
					return transform;
				}
			});

			await vi.waitFor(() => {
				expect(floating.floatingStyles).contain('transform: translate(0px, 0px)');
			});

			transform = false;

			await vi.waitFor(() => {
				expect(floating.floatingStyles).not.contain('transform: translate(0px, 0px)');
			});
		});
	});

	describe('strategy', () => {
		testInEffect('strategy can be set', () => {
			const strategy = 'fixed';
			const floating = useFloating({ strategy });
			expect(floating.strategy).toBe(strategy);
		});
		testInEffect('strategy is returned', () => {
			const floating = useFloating();
			expect(floating).toHaveProperty('strategy');
		});
		testInEffect('strategy is of type Strategy', () => {
			const floating = useFloating();
			expectTypeOf(floating.strategy).toMatchTypeOf<Strategy>();
		});
		testInEffect('strategy defaults to "absolute"', () => {
			const floating = useFloating();
			expect(floating.strategy).toBe('absolute');
		});
		testInEffect('strategy is reactive', async () => {
			let strategy: Strategy = $state('absolute');
			const floating = useFloating({
				elements: {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				},
				get strategy() {
					return strategy;
				}
			});

			expect(floating.strategy).toBe(strategy);

			strategy = 'fixed';

			await vi.waitFor(() => {
				expect(floating.strategy).toBe(strategy);
			});
		});
	});

	describe('placement', () => {
		testInEffect('placement can be set', () => {
			const placement = 'top';
			const floating = useFloating({ placement });
			expect(floating.placement).toBe(placement);
		});
		testInEffect('placement is returned', () => {
			const floating = useFloating();
			expect(floating).toHaveProperty('placement');
		});
		testInEffect('placement is of type Placement', () => {
			const floating = useFloating();
			expectTypeOf(floating.placement).toMatchTypeOf<Placement>();
		});
		testInEffect('placement defaults to "bottom"', () => {
			const floating = useFloating();
			expect(floating.placement).toBe('bottom');
		});
		testInEffect('placement is reactive', async () => {
			let placement: Placement = $state('bottom');
			const floating = useFloating({
				elements: {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				},
				get placement() {
					return placement;
				}
			});

			expect(floating.placement).toBe(placement);

			placement = 'top';

			await vi.waitFor(() => {
				expect(floating.placement).toBe(placement);
			});
		});
	});

	describe('middleware', () => {
		testInEffect('middleware can be set', async () => {
			const middleware: Array<Middleware> = [offset(5)];
			const floating = useFloating({
				elements: {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				},
				middleware
			});
			await vi.waitFor(() => {
				expect(floating.x).toBe(0);
				expect(floating.y).toBe(5);
			});
		});
		testInEffect('middleware is reactive', async () => {
			const middleware: Array<Middleware> = $state([]);
			const floating = useFloating({
				elements: {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				},
				get middleware() {
					return middleware;
				}
			});

			await vi.waitFor(() => {
				expect(floating.x).toBe(0);
				expect(floating.y).toBe(0);
			});

			middleware.push(offset(10));

			await vi.waitFor(() => {
				expect(floating.x).toBe(0);
				expect(floating.y).toBe(10);
			});
		});
	});

	describe('open', () => {
		testInEffect('open can be set', () => {
			const floating = useFloating({ open: true });
			expect(floating.open).toBe(true);
		});
		testInEffect('open is returned', () => {
			const floating = useFloating();
			expect(floating).toHaveProperty('open');
		});
		testInEffect('open defaults to true', () => {
			const floating = useFloating();
			expect(floating.open).toBe(true);
		});
		testInEffect('open is of type boolean', () => {
			const floating = useFloating();
			expectTypeOf(floating.open).toMatchTypeOf<boolean>();
		});
		testInEffect('open is reactive', async () => {
			let open = $state(false);
			const floating = useFloating({
				elements: {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				},
				get open() {
					return open;
				}
			});

			expect(floating.open).toBe(open);

			open = true;

			await vi.waitFor(() => {
				expect(floating.open).toBe(open);
			});
		});

		testInEffect('type', () => {
			const floating = useFloating();
			expect(floating.open).toBeTypeOf('boolean');
		});
		testInEffect('default', () => {
			const floating = useFloating();
			expect(floating.open).toBe(true);
		});
	});

	describe('whileElementsMounted', () => {
		testInEffect('whileElementsMounted can be set', async () => {
			const whileElementsMounted = vi.fn();
			useFloating({
				elements: {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				},
				whileElementsMounted
			});

			await vi.waitFor(() => {
				expect(whileElementsMounted).toHaveBeenCalled();
			});
		});
		testInEffect('whileElementsMounted is only called when elements are mounted', async () => {
			const whileElementsMounted = vi.fn();
			useFloating({
				elements: {
					reference: undefined,
					floating: undefined
				},
				whileElementsMounted
			});

			await vi.waitFor(() => {
				expect(whileElementsMounted).not.toHaveBeenCalled();
			});
		});
		testInEffect(
			"whileElementsMounted's cleanup function is called when elements are unmounted",
			async () => {
				const cleanup = vi.fn();
				const whileElementsMounted = vi.fn(() => cleanup);
				const floating = useFloating({
					elements: {
						reference: document.createElement('div'),
						floating: document.createElement('div')
					},
					whileElementsMounted
				});

				await vi.waitFor(() => {
					expect(whileElementsMounted).toHaveBeenCalled();
				});

				floating.elements.reference = undefined;
				floating.elements.floating = undefined;

				await vi.waitFor(() => {
					expect(cleanup).toHaveBeenCalled();
				});
			}
		);
		testInEffect('whileElementsMounted is called with the correct arguments', async () => {
			const whileElementsMounted = vi.fn();
			const elements = {
				reference: document.createElement('div'),
				floating: document.createElement('div')
			};

			const floating = useFloating({
				elements,
				whileElementsMounted
			});

			await vi.waitFor(() => {
				expect(whileElementsMounted).toHaveBeenCalledWith(
					elements.reference,
					elements.floating,
					floating.update
				);
			});
		});
	});

	describe('onOpenChange', () => {
		testInEffect('onOpenChange can be set', async () => {
			const onOpenChange = vi.fn();
			useFloating({
				elements: {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				},
				onOpenChange
			});

			await vi.waitFor(() => {
				expect(onOpenChange).not.toHaveBeenCalled();
			});
		});
		// TODO: Add tests for onOpenChange once we have well tested hooks that can trigger the open state
	});

	describe('x', () => {
		testInEffect('x is returned', () => {
			const floating = useFloating();
			expect(floating).toHaveProperty('x');
		});
		testInEffect('x is of type number', () => {
			const floating = useFloating();
			expectTypeOf(floating.x).toMatchTypeOf<number>();
		});
		testInEffect('x defaults to 0', () => {
			const floating = useFloating();
			expect(floating.x).toBe(0);
		});
		testInEffect('x is reactively set based on placement', async () => {
			let placement: Placement = $state('left');
			const floating = useFloating({
				elements: {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				},
				middleware: [offset(10)],
				get placement() {
					return placement;
				}
			});

			await vi.waitFor(() => {
				expect(floating.x).toBe(-10);
			});

			placement = 'right';

			await vi.waitFor(() => {
				expect(floating.x).toBe(10);
			});
		});
	});

	describe('y', () => {
		testInEffect('y is returned', () => {
			const floating = useFloating();
			expect(floating).toHaveProperty('y');
		});
		testInEffect('y is of type number', () => {
			const floating = useFloating();
			expectTypeOf(floating.y).toMatchTypeOf<number>();
		});
		testInEffect('y defaults to 0', () => {
			const floating = useFloating();
			expect(floating.y).toBe(0);
		});
		testInEffect('y is reactively set based on placement', async () => {
			let placement: Placement = $state('top');
			const floating = useFloating({
				elements: {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				},
				middleware: [offset(10)],
				get placement() {
					return placement;
				}
			});

			await vi.waitFor(() => {
				expect(floating.y).toBe(-10);
			});

			placement = 'bottom';

			await vi.waitFor(() => {
				expect(floating.y).toBe(10);
			});
		});
	});

	describe('middlewareData', () => {
		testInEffect('middlewareData is returned', () => {
			const floating = useFloating();
			expect(floating).toHaveProperty('middlewareData');
		});
		testInEffect('middlewareData is of type MiddlewareData', () => {
			const floating = useFloating();
			expectTypeOf(floating.middlewareData).toMatchTypeOf<MiddlewareData>();
		});
		testInEffect('middlewareData defaults to {}', () => {
			const floating = useFloating();
			expect(floating.middlewareData).toEqual({});
		});
		testInEffect(
			'middlewareData is reactively set based on data returned by middleware',
			async () => {
				const middleware: Array<Middleware> = $state([]);

				const floating = useFloating({
					elements: {
						reference: document.createElement('div'),
						floating: document.createElement('div')
					},
					get middleware() {
						return middleware;
					}
				});

				await vi.waitFor(() => {
					expect(floating.middlewareData).toEqual({});
				});

				middleware.push({
					name: 'foobar',
					fn: () => ({ data: { foo: 'bar' } })
				});

				await vi.waitFor(() => {
					expect(floating.middlewareData).toEqual({ foobar: { foo: 'bar' } });
				});
			}
		);
	});

	describe('isPositioned', () => {
		testInEffect('presence', () => {
			const floating = useFloating();
			expect(floating).toHaveProperty('isPositioned');
		});
		testInEffect('type', () => {
			const floating = useFloating();
			expect(floating.isPositioned).toBeTypeOf('boolean');
		});
		testInEffect('default', () => {
			const floating = useFloating();
			expect(floating.isPositioned).toBe(false);
		});
		testInEffect('isPositioned is set to true once the position is calculated', async () => {
			const floating = useFloating({
				open: false,
				elements: {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				}
			});

			expect(floating.isPositioned).toBe(false);

			await floating.update();

			vi.waitFor(() => {
				expect(floating.isPositioned).toBe(true);
			});
		});
		testInEffect('isPositioned is reset to false when open is set to false', async () => {
			let open = $state(true);
			const floating = useFloating({
				elements: {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				},
				get open() {
					return open;
				}
			});

			await vi.waitFor(() => {
				expect(floating.isPositioned).toBe(true);
			});

			open = false;

			await vi.waitFor(() => {
				expect(floating.isPositioned).toBe(false);
			});
		});
	});

	describe('floatingStyles', () => {
		testInEffect('floatingStyles is returned', () => {
			const floating = useFloating();
			expect(floating).toHaveProperty('floatingStyles');
		});
		testInEffect('floatingStyles is of type string', () => {
			const floating = useFloating();
			expectTypeOf(floating.floatingStyles).toMatchTypeOf<string>();
		});
		testInEffect('floatingStyles defaults to position: absolute; left: 0px; top: 0px;', () => {
			const floating = useFloating();
			expect(floating.floatingStyles).toBe('position: absolute; left: 0px; top: 0px;');
		});
	});

	describe('update', () => {
		testInEffect('update is returned', () => {
			const floating = useFloating();
			expect(floating).toHaveProperty('update');
		});
		testInEffect('update is of type function', () => {
			const floating = useFloating();
			expectTypeOf(floating.update).toBeFunction();
		});
	});

	describe('context', () => {
		testInEffect('context is returned', () => {
			const floating = useFloating();
			expect(floating).toHaveProperty('context');
		});
		testInEffect('context is of type FloatingContext', () => {
			const floating = useFloating();
			expectTypeOf(floating.context).toMatchTypeOf<FloatingContext>();
		});
	});
});
