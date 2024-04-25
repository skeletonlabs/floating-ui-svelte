import {
	type FloatingContext,
	type UseFloatingOptions,
	type UseFloatingReturn
} from '$lib/types.js';
import { roundByDPR } from '$lib/util/dpr.js';
import { styleObjectToString } from '$lib/util/style-object-to-string.js';
import { autoUpdate, computePosition, type MiddlewareData } from '@floating-ui/dom';
import { untrack } from 'svelte';

export function useFloating(options: UseFloatingOptions = {}): UseFloatingReturn {
	let placement = $state(options.placement ?? 'bottom');
	let strategy = $state(options.strategy ?? 'absolute');
	let x = $state(0);
	let y = $state(0);
	let middlewareData = $state<MiddlewareData>({});
	let isPositioned = $state(false);
	let open = $state(options.open ?? false);
	const transform = $state(options.transform ?? false);
	const middleware = $state(options.middleware ?? []);
	const refs = $state<UseFloatingReturn['refs']>({
		reference: options.elements?.reference,
		floating: options.elements?.floating
	});
	const floatingStyles = $derived.by<Partial<CSSStyleDeclaration>>(() => {
		if (!refs.floating) {
			return {
				position: strategy,
				left: '0px',
				top: '0px'
			};
		}

		const left = roundByDPR(refs.floating, x);
		const top = roundByDPR(refs.floating, y);

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
	const context = $state<FloatingContext>({
		get open() {
			return open;
		},
		set open(value) {
			open = value;
		},
		refs
	});

	async function update() {
		if (!refs.reference || !refs.floating) {
			return;
		}
		const position = await computePosition(refs.reference, refs.floating, {
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

	$effect(() => {
		if (!refs.reference || !refs.floating) {
			return;
		}
		return autoUpdate(refs.reference, refs.floating, update);
	});

	$effect(() => {
		if (options.open) {
			return;
		}
		untrack(() => (isPositioned = false));
	});

	return {
		get context() {
			return context;
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
			return refs;
		}
	};
}
