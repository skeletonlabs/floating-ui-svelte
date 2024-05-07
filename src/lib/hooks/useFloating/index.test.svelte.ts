import { describe, expect, vi } from 'vitest';
import { testInEffect } from '$lib/test-utils.svelte.js';
import { useFloating } from './index.svelte.js';
import { offset, type Middleware, type Placement, type Strategy } from '@floating-ui/dom';

describe('useFloating', () => {
	describe('options', () => {
		describe('elements', () => {
			testInEffect('elements can be set through options', () => {
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

		describe('strategy', () => {
			testInEffect('strategy can be set through options', () => {
				const strategy = 'fixed';
				const floating = useFloating({ strategy });
				expect(floating.strategy).toBe(strategy);
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
			testInEffect('placement can be set through options', () => {
				const placement = 'top';
				const floating = useFloating({ placement });
				expect(floating.placement).toBe(placement);
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
			testInEffect('middleware is properly passed through', async () => {
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
			testInEffect('open can be set through options', () => {
				const floating = useFloating({ open: true });
				expect(floating.open).toBe(true);
			});
			testInEffect('open defaults to true', () => {
				const floating = useFloating();
				expect(floating.open).toBe(true);
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
		});

		describe('whileElementsMounted', () => {
			testInEffect('whileElementsMounted can be set through options', async () => {
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
		});
	});

	describe('returns', () => {
		describe('x', () => {
			testInEffect('presence', () => {
				const floating = useFloating();
				expect(floating).toHaveProperty('x');
			});
			testInEffect('type', () => {
				const floating = useFloating();
				expect(floating.x).toBeTypeOf('number');
			});
		});

		describe('y', () => {
			testInEffect('presence', () => {
				const floating = useFloating();
				expect(floating).toHaveProperty('y');
			});
			testInEffect('type', () => {
				const floating = useFloating();
				expect(floating.y).toBeTypeOf('number');
			});
		});

		describe('placement', () => {
			testInEffect('presence', () => {
				const floating = useFloating();
				expect(floating).toHaveProperty('placement');
			});
			testInEffect('type', () => {
				const floating = useFloating();
				expect(floating.placement).toBeTypeOf('string');
			});
		});

		describe('strategy', () => {
			testInEffect('presence', () => {
				const floating = useFloating();
				expect(floating).toHaveProperty('strategy');
			});
			testInEffect('type', () => {
				const floating = useFloating();
				expect(floating.strategy).toBeTypeOf('string');
			});
		});

		describe('middlewareData', () => {
			testInEffect('presence', () => {
				const floating = useFloating();
				expect(floating).toHaveProperty('middlewareData');
			});
			testInEffect('type', () => {
				const floating = useFloating();
				expect(floating.middlewareData).toBeTypeOf('object');
			});
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
		});

		describe('open', () => {
			testInEffect('presence', () => {
				const floating = useFloating();
				expect(floating).toHaveProperty('open');
			});
			testInEffect('type', () => {
				const floating = useFloating();
				expect(floating.open).toBeTypeOf('boolean');
			});
		});

		describe('floatingStyles', () => {
			testInEffect('presence', () => {
				const floating = useFloating();
				expect(floating).toHaveProperty('floatingStyles');
			});
		});

		describe('elements', () => {
			testInEffect('presence', () => {
				const floating = useFloating();
				expect(floating).toHaveProperty('elements');
			});
		});

		describe('update', () => {
			testInEffect('presence', () => {
				const floating = useFloating();
				expect(floating).toHaveProperty('update');
			});
			testInEffect('type', () => {
				const floating = useFloating();
				expect(floating.update).toBeTypeOf('function');
			});
		});

		describe('context', () => {
			testInEffect('presence', () => {
				const floating = useFloating();
				expect(floating).toHaveProperty('context');
			});
		});
	});
});
