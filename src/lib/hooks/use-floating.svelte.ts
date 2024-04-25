import { box } from '$lib/box.svelte.js';
import { type UseFloatingOptions, type UseFloatingReturn } from '$lib/types.js';
import { roundByDPR, styleObjectToString } from '$lib/utils.js';
import { type MiddlewareData, autoUpdate, computePosition } from '@floating-ui/dom';

/**
 * Hook for managing floating elements.
 * Aims to keep as much parity with `@floating-ui/react` as possible.
 * For now see: https://floating-ui.com/docs/useFloating for API documentation.
 */
export function useFloating(options: UseFloatingOptions = {}): UseFloatingReturn {
	const openOption = box.from(options.open ?? true);
	const middlewareOption = box.from(options.middleware ?? []);
	const placementOption = box.from(options.placement ?? 'bottom');
	const strategyOption = box.from(options.strategy ?? 'absolute');
	const transformOption = box.from(options.transform ?? true);
	const referenceElement = box(options.elements?.reference);
	const floatingElement = box(options.elements?.floating);
	const x = box(0);
	const y = box(0);
	const strategy = box(strategyOption.value);
	const placement = box(placementOption.value);
	const middlewareData = box<MiddlewareData>({});
	const isPositioned = box(false);
	const floatingStylesObject = box.from(() => {
		const initialStyles = {
			position: strategy.value,
			left: '0',
			top: '0'
		};

		if (!floatingElement.value) {
			return initialStyles;
		}

		const roundedX = roundByDPR(floatingElement.value, x.value);
		const roundedY = roundByDPR(floatingElement.value, y.value);

		if (transformOption.value) {
			return {
				...initialStyles,
				transform: `translate(${roundedX}px, ${roundedY}px)`
			};
		}

		return {
			position: strategy.value,
			left: `${roundedX}px`,
			top: `${roundedY}px`
		};
	});
	const floatingStyles = box.from(() => styleObjectToString(floatingStylesObject.value));

	/** Functions */
	async function update() {
		if (!referenceElement.value || !floatingElement.value) {
			return;
		}
		const position = await computePosition(referenceElement.value, floatingElement.value, {
			placement: placementOption.value,
			middleware: middlewareOption.value,
			strategy: strategyOption.value
		});
		x.value = position.x;
		y.value = position.y;
		strategy.value = position.strategy;
		placement.value = position.placement;
		middlewareData.value = position.middlewareData;
		isPositioned.value = true;
	}

	/** Effects */
	$effect(() => {
		if (!referenceElement.value || !floatingElement.value) {
			return;
		}
		return autoUpdate(referenceElement.value, floatingElement.value, update);
	});
	$effect(() => {
		if (openOption.value) {
			return;
		}
		isPositioned.value = false;
	});

	return {
		get x() {
			return x.value;
		},
		get y() {
			return y.value;
		},
		get strategy() {
			return strategy.value;
		},
		get placement() {
			return placement.value;
		},
		get middlewareData() {
			return middlewareData.value;
		},
		get isPositioned() {
			return isPositioned.value;
		},
		get floatingStyles() {
			return floatingStyles.value;
		},
		update,
		refs: {
			get reference() {
				return referenceElement.value;
			},
			set reference(v) {
				referenceElement.value = v;
			},
			get floating() {
				return floatingElement.value;
			},
			set floating(v) {
				floatingElement.value = v;
			}
		}
	};
}
