import type { UseFloatingOptions, UseFloatingReturn } from '$lib/types.js';
import { getDPR, noop, roundByDPR, styleObjectToString } from '$lib/utils.js';
import type { MiddlewareData, ReferenceElement } from '@floating-ui/dom';
import { computePosition } from '@floating-ui/dom';

/**
 * Hook for managing floating elements.
 * Aims to keep as much parity with `@floating-ui/react` as possible.
 * For now see: https://floating-ui.com/docs/useFloating for API documentation.
 */
export function useFloating<T extends ReferenceElement = ReferenceElement>(
	options: UseFloatingOptions<T> = {}
): UseFloatingReturn<T> {
	const openOption = $derived(options.open ?? true);
	const onOpenChangeOption = options.onOpenChange ?? noop;
	const placementOption = $derived(options.placement ?? 'bottom');
	const strategyOption = $derived(options.strategy ?? 'absolute');
	const middlewareOption = $derived(options.middleware);
	const transformOption = $derived(options.transform ?? true);
	const elements = $derived(options.elements ?? {});
	const whileElementsMountedOption = options.whileElementsMounted;

	let x = $state(0);
	let y = $state(0);
	let strategy = $state(strategyOption);
	let placement = $state(placementOption);
	let middlewareData = $state<MiddlewareData>({});
	let isPositioned = $state(false);

	const floatingStyles = $derived.by(() => {
		const initialStyles = {
			position: strategy,
			left: '0',
			top: '0'
		};

		const { floating } = elements;
		if (floating == null) {
			return styleObjectToString(initialStyles);
		}

		const xVal = roundByDPR(floating, x);
		const yVal = roundByDPR(floating, y);

		if (transformOption) {
			return styleObjectToString({
				...initialStyles,
				transform: `translate(${xVal}px, ${yVal}px)`,
				...(getDPR(floating) >= 1.5 && { willChange: 'transform' })
			});
		}

		return styleObjectToString({
			position: strategy,
			left: `${xVal}px`,
			top: `${yVal}px`
		});
	});

	function update() {
		const { reference, floating } = elements;
		if (reference == null || floating == null) {
			return;
		}

		computePosition(reference, floating, {
			middleware: middlewareOption,
			placement: placementOption,
			strategy: strategyOption
		}).then((position) => {
			x = position.x;
			y = position.y;
			strategy = position.strategy;
			placement = position.placement;
			middlewareData = position.middlewareData;
			isPositioned = true;
		});
	}

	function attach() {
		if (whileElementsMountedOption === undefined) {
			update();
			return;
		}

		const { floating, reference } = elements;
		if (reference != null && floating != null) {
			return whileElementsMountedOption(reference, floating, update);
		}
	}

	function reset() {
		if (!openOption) {
			isPositioned = false;
		}
	}

	$effect.pre(update);
	$effect.pre(attach);
	$effect.pre(reset);

	return {
		get x() {
			return x;
		},
		get y() {
			return y;
		},
		get strategy() {
			return strategy;
		},
		get placement() {
			return placement;
		},
		get middlewareData() {
			return middlewareData;
		},
		get isPositioned() {
			return isPositioned;
		},
		get floatingStyles() {
			return floatingStyles;
		},
		update,
		context: {
			get open() {
				return openOption;
			},
			onOpenChange: onOpenChangeOption,
			get elements() {
				return elements;
			}
		}
	};
}
