import { box } from '$lib/box.svelte.js';
import type { UseFloatingOptions, UseFloatingReturn } from '$lib/types.js';
import { getDPR, noop, roundByDPR, styleObjectToString } from '$lib/utils.js';
import type { MiddlewareData, ReferenceElement } from '@floating-ui/dom';
import { computePosition } from '@floating-ui/dom';
import { onDestroy } from 'svelte';

/**
 * Hook for managing floating elements.
 * Aims to keep as much parity with `@floating-ui/react` as possible.
 * For now see: https://floating-ui.com/docs/useFloating for API documentation.
 */
export function useFloating<T extends ReferenceElement = ReferenceElement>(
	options: UseFloatingOptions<T> = {}
): UseFloatingReturn {
	const openOption = box.derived(() => options.open ?? true);
	const onOpenChangeOption = options.onOpenChange ?? noop;
	const placementOption = box.derived(() => options.placement ?? 'bottom');
	const strategyOption = box.derived(() => options.strategy ?? 'absolute');
	const middlewareOption = box.derived(() => options.middleware);
	const transformOption = box.derived(() => options.transform ?? true);
	const referenceElement = box.derived(() => options.elements?.reference);
	const floatingElement = box.derived(() => options.elements?.floating);
	const whileElementsMountedOption = options.whileElementsMounted;

	const x = box(0);
	const y = box(0);
	const strategy = box(strategyOption.value);
	const placement = box(placementOption.value);
	const middlewareData = box<MiddlewareData>({});
	const isPositioned = box(false);
	const floatingStyles = box.derived(() => {
		const initialStyles = {
			position: strategy.value,
			left: '0',
			top: '0'
		};

		if (!floatingElement.value) {
			return styleObjectToString(initialStyles);
		}

		const xVal = roundByDPR(floatingElement.value, x.value);
		const yVal = roundByDPR(floatingElement.value, y.value);

		if (transformOption.value) {
			return styleObjectToString({
				...initialStyles,
				transform: `translate(${xVal}px, ${yVal}px)`,
				...(getDPR(floatingElement.value) >= 1.5 && { willChange: 'transform' })
			});
		}

		return styleObjectToString({
			position: strategy.value,
			left: `${xVal}px`,
			top: `${yVal}px`
		});
	});

	let whileElementsMountedCleanup: (() => void) | undefined;

	function update() {
		if (
			referenceElement.value === null ||
			referenceElement.value === undefined ||
			floatingElement.value === null ||
			floatingElement.value === undefined
		) {
			return;
		}

		computePosition(referenceElement.value, floatingElement.value, {
			middleware: middlewareOption.value,
			placement: placementOption.value,
			strategy: strategyOption.value
		}).then((position) => {
			x.value = position.x;
			y.value = position.y;
			strategy.value = position.strategy;
			placement.value = position.placement;
			middlewareData.value = position.middlewareData;
			isPositioned.value = true;
		});
	}

	function attach() {
		cleanup();

		if (whileElementsMountedOption === undefined) {
			update();
			return;
		}

		if (referenceElement.value != null && floatingElement.value != null) {
			whileElementsMountedCleanup = whileElementsMountedOption(
				referenceElement.value,
				floatingElement.value,
				update
			);
			return;
		}
	}

	function reset() {
		if (!openOption.value) {
			isPositioned.value = false;
		}
	}

	function cleanup() {
		if (typeof whileElementsMountedCleanup === 'function') {
			whileElementsMountedCleanup();
			whileElementsMountedCleanup = undefined;
		}
	}

	$effect.pre(update);
	$effect.pre(attach);
	$effect.pre(reset);

	onDestroy(cleanup);

	return {
		x: box.readonly(x),
		y: box.readonly(y),
		strategy: box.readonly(strategy),
		placement: box.readonly(placement),
		middlewareData: box.readonly(middlewareData),
		isPositioned: box.readonly(isPositioned),
		floatingStyles,
		update,
		context: {
			open: openOption,
			onOpenChange: onOpenChangeOption,
			elements: {
				reference: box.readonly(referenceElement),
				floating: box.readonly(floatingElement)
			}
		}
	};
}
