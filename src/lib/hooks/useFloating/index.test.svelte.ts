import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { withEffect } from '$lib/test-utils.svelte.js';
import { useFloating, type FloatingContext, type UseFloatingOptions } from './index.svelte.js';
import {
	offset,
	type Middleware,
	type MiddlewareData,
	type Placement,
	type Strategy
} from '@floating-ui/dom';

describe('useFloating', () => {
	describe('elements', () => {
		it(
			'can be set',
			withEffect(() => {
				const elements = {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				};

				const floating = useFloating({ elements });

				expect(floating.elements).toEqual(elements);
			})
		);
		it(
			'can be set through the return value',
			withEffect(() => {
				const elements = {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				};

				const floating = useFloating();

				floating.elements.reference = elements.reference;
				floating.elements.floating = elements.floating;

				expect(floating.elements).toEqual(elements);
			})
		);
		it(
			'is returned',
			withEffect(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty('elements');
			})
		);
		it(
			'is an object',
			withEffect(() => {
				const floating = useFloating();
				expect(floating.elements).toBeTypeOf('object');
			})
		);
		it(
			'defaults to {}',
			withEffect(() => {
				const floating = useFloating();
				expect(floating.elements).toEqual({});
			})
		);
		it(
			'is reactive',
			withEffect(async () => {
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
			})
		);
	});

	describe('transform', () => {
		it(
			'can be set',
			withEffect(async () => {
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
			})
		);
		it(
			'defaults to "true"',
			withEffect(async () => {
				const floating = useFloating({
					elements: {
						reference: document.createElement('div'),
						floating: document.createElement('div')
					}
				});
				await vi.waitFor(() => {
					expect(floating.floatingStyles).contain('transform: translate(0px, 0px)');
				});
			})
		);
		it(
			'is reactive',
			withEffect(async () => {
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
			})
		);
	});

	describe('strategy', () => {
		it(
			'can be set',
			withEffect(() => {
				const strategy = 'fixed';
				const floating = useFloating({ strategy });
				expect(floating.strategy).toBe(strategy);
			})
		);
		it(
			'is returned',
			withEffect(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty('strategy');
			})
		);
		it(
			'is of type Strategy',
			withEffect(() => {
				const floating = useFloating();
				expectTypeOf(floating.strategy).toMatchTypeOf<Strategy>();
			})
		);
		it(
			'defaults to "absolute"',
			withEffect(() => {
				const floating = useFloating();
				expect(floating.strategy).toBe('absolute');
			})
		);
		it(
			'is reactive',
			withEffect(async () => {
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
			})
		);
	});

	describe('placement', () => {
		it(
			'can be set',
			withEffect(() => {
				const placement = 'top';
				const floating = useFloating({ placement });
				expect(floating.placement).toBe(placement);
			})
		);
		it(
			'is returned',
			withEffect(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty('placement');
			})
		);
		it(
			'is of type Placement',
			withEffect(() => {
				const floating = useFloating();
				expectTypeOf(floating.placement).toMatchTypeOf<Placement>();
			})
		);
		it(
			'defaults to "bottom"',
			withEffect(() => {
				const floating = useFloating();
				expect(floating.placement).toBe('bottom');
			})
		);
		it(
			'is reactive',
			withEffect(async () => {
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
			})
		);
	});

	describe('middleware', () => {
		it(
			'can be set',
			withEffect(async () => {
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
			})
		);
		it(
			'is reactive',
			withEffect(async () => {
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
			})
		);
	});

	describe('open', () => {
		it(
			'can be set',
			withEffect(() => {
				const floating = useFloating({ open: true });
				expect(floating.open).toBe(true);
			})
		);
		it(
			'is returned',
			withEffect(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty('open');
			})
		);
		it(
			'defaults to true',
			withEffect(() => {
				const floating = useFloating();
				expect(floating.open).toBe(true);
			})
		);
		it(
			'is of type boolean',
			withEffect(() => {
				const floating = useFloating();
				expectTypeOf(floating.open).toMatchTypeOf<boolean>();
			})
		);
		it(
			'is reactive',
			withEffect(async () => {
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
			})
		);
	});

	describe('whileElementsMounted', () => {
		it(
			'can be set',
			withEffect(async () => {
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
			})
		);
		it(
			'is only called when elements are mounted',
			withEffect(async () => {
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
			})
		);
		it(
			'calls the cleanup function when elements are unmounted',
			withEffect(async () => {
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
			})
		);
		it(
			'is called with the correct arguments',
			withEffect(async () => {
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
			})
		);
	});

	describe('onOpenChange', () => {
		it(
			'can be set',
			withEffect(async () => {
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
			})
		);
		// TODO: Add tests for onOpenChange once we have well tested hooks that can trigger the open state
	});

	describe('x', () => {
		it(
			'is returned',
			withEffect(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty('x');
			})
		);
		it(
			'is of type number',
			withEffect(() => {
				const floating = useFloating();
				expectTypeOf(floating.x).toMatchTypeOf<number>();
			})
		);
		it(
			'defaults to 0',
			withEffect(() => {
				const floating = useFloating();
				expect(floating.x).toBe(0);
			})
		);
		it(
			'is reactively set based on placement',
			withEffect(async () => {
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
			})
		);
	});

	describe('y', () => {
		it(
			'is returned',
			withEffect(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty('y');
			})
		);
		it(
			'is of type number',
			withEffect(() => {
				const floating = useFloating();
				expectTypeOf(floating.y).toMatchTypeOf<number>();
			})
		);
		it(
			'defaults to 0',
			withEffect(() => {
				const floating = useFloating();
				expect(floating.y).toBe(0);
			})
		);
		it(
			'is reactively set based on placement',
			withEffect(async () => {
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
			})
		);
	});

	describe('middlewareData', () => {
		it(
			'is returned',
			withEffect(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty('middlewareData');
			})
		);
		it(
			'is of type MiddlewareData',
			withEffect(() => {
				const floating = useFloating();
				expectTypeOf(floating.middlewareData).toMatchTypeOf<MiddlewareData>();
			})
		);
		it(
			'defaults to {}',
			withEffect(() => {
				const floating = useFloating();
				expect(floating.middlewareData).toEqual({});
			})
		);
		it(
			'is reactively set based on data returned by middleware',
			withEffect(async () => {
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
			})
		);
	});

	describe('isPositioned', () => {
		it(
			'is returned',
			withEffect(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty('isPositioned');
			})
		);
		it(
			'is of type boolean',
			withEffect(() => {
				const floating = useFloating();
				expectTypeOf(floating.isPositioned).toMatchTypeOf<boolean>();
			})
		);
		it(
			'defaults to false',
			withEffect(() => {
				const floating = useFloating();
				expect(floating.isPositioned).toBe(false);
			})
		);
		it(
			'is set to true once the position is calculated',
			withEffect(async () => {
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
			})
		);
		it(
			'isPositioned is reset to false when open is set to false',
			withEffect(async () => {
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
			})
		);
	});

	describe('floatingStyles', () => {
		it(
			'is returned',
			withEffect(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty('floatingStyles');
			})
		);
		it(
			'is of type string',
			withEffect(() => {
				const floating = useFloating();
				expectTypeOf(floating.floatingStyles).toMatchTypeOf<string>();
			})
		);
		it(
			'defaults to position: absolute; left: 0px; top: 0px;',
			withEffect(() => {
				const floating = useFloating();
				expect(floating.floatingStyles).toBe('position: absolute; left: 0px; top: 0px;');
			})
		);
	});

	describe('update', () => {
		it(
			'is returned',
			withEffect(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty('update');
			})
		);
		it(
			'is of type function',
			withEffect(() => {
				const floating = useFloating();
				expectTypeOf(floating.update).toBeFunction();
			})
		);
	});

	describe('context', () => {
		it(
			'is returned',
			withEffect(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty('context');
			})
		);
		it(
			'is of type FloatingContext',
			withEffect(() => {
				const floating = useFloating();
				expectTypeOf(floating.context).toMatchTypeOf<FloatingContext>();
			})
		);
		it(
			'is reactive',
			withEffect(async () => {
				const options: UseFloatingOptions = $state({});

				const floating = useFloating(options);

				expect(floating.elements).toEqual({});
				expect(floating.context.open).toBe(true);
				expect(floating.context.strategy).toBe('absolute');
				expect(floating.context.placement).toBe('bottom');
				expect(floating.context.x).toBe(0);
				expect(floating.context.y).toBe(0);
				expect(floating.context.isPositioned).toBe(false);

				options.elements = {
					reference: document.createElement('div'),
					floating: document.createElement('div')
				};
				options.open = false;
				options.strategy = 'fixed';
				options.placement = 'top';
				options.middleware = [offset(10)];

				await vi.waitFor(() => {
					expect(floating.context.elements).toEqual(options.elements);
					expect(floating.context.open).toBe(options.open);
					expect(floating.context.strategy).toBe(options.strategy);
					expect(floating.context.placement).toBe(options.placement);
					expect(floating.context.x).toBe(-10);
					expect(floating.context.y).toBe(0);
					expect(floating.context.isPositioned).toBe(false);
				});
			})
		);
	});
});
