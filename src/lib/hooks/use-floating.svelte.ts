import { type UseFloatingOptions, type UseFloatingReturn } from '$lib/types.js';
import { roundByDPR, styleObjectToString, unwrap } from '$lib/utils.js';
import { type MiddlewareData, autoUpdate, computePosition } from '@floating-ui/dom';

/**
 * Hook for managing floating elements.
 * Aims to keep as much parity with `@floating-ui/react
 */
export function useFloating(options: UseFloatingOptions = {}): UseFloatingReturn {
	/** State */
	let reference = $derived(unwrap(options.elements?.reference ?? null));
	let floating = $derived(unwrap(options.elements?.floating ?? null));
	let placement = $derived(unwrap(options.placement ?? 'bottom-start'));
	let strategy = $derived(unwrap(options.strategy ?? 'absolute'));
	let open = $derived(unwrap(options.open ?? false));
	let x = $state(0);
	let y = $state(0);
	let middlewareData = $state<MiddlewareData>({});
	let isPositioned = $state(false);
	const transform = $derived(unwrap(options.transform ?? false));
	const middleware = $derived(unwrap(options.middleware ?? []));
	const floatingStyles = $derived.by<Partial<CSSStyleDeclaration>>(() => {
		if (!floating) {
			return {
				position: strategy,
				left: '0px',
				top: '0px'
			};
		}

		const left = roundByDPR(floating, x);
		const top = roundByDPR(floating, y);

		if (transform) {
			return {
				position: strategy,
				transform: `translate(${left}px, ${top}px)`
			};
		}

		return {
			position: strategy,
			left: `${left}px`,
			top: `${top}px`
		};
	});

	/** Functions */
	async function update() {
		if (!reference || !floating) {
			return;
		}
		const position = await computePosition(reference, floating, {
			placement,
			middleware,
			strategy
		});
		x = position.x;
		y = position.y;
		strategy = position.strategy;
		placement = position.placement;
		middlewareData = position.middlewareData;
		isPositioned = true;
	}

	/** Effects */
	$effect(() => {
		if (!reference || !floating) {
			return;
		}
		return autoUpdate(reference, floating, update);
	});

	$effect(() => {
		if (open) {
			return;
		}
		isPositioned = false;
	});

	return {
		get context() {
			return {
				get open() {
					return open;
				},
				set open(v) {
					open = v;
				},
				get refs() {
					return {
						get reference() {
							return reference;
						},
						get floating() {
							return floating;
						}
					};
				}
			};
		},
		get placement() {
			return placement;
		},
		get strategy() {
			return strategy;
		},
		get x() {
			return x;
		},
		get y() {
			return y;
		},
		get middlewareData() {
			return middlewareData;
		},
		get isPositioned() {
			return isPositioned;
		},
		get update() {
			return update;
		},
		get floatingStyles() {
			return styleObjectToString(floatingStyles);
		},
		get refs() {
			return {
				get reference() {
					return reference;
				},
				set reference(v) {
					reference = v;
				},
				get floating() {
					return floating;
				},
				set floating(v) {
					floating = v;
				}
			};
		}
	};
}
