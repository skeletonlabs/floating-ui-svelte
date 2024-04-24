import type { UseFloatingOptions, UseFloatingReturn } from '$lib/types.js';
import { roundByDPR } from '$lib/util/dpr.js';
import { styleObjectToString } from '$lib/util/style-object-to-string.js';
import { autoUpdate, computePosition, type MiddlewareData } from '@floating-ui/dom';

export function useFloating(options: UseFloatingOptions = {}): UseFloatingReturn {
	/** State */
	let strategy = $state(options.strategy ?? 'absolute');
	let placement = $state(options.placement ?? 'bottom');
	let middlewareData = $state<MiddlewareData>({});
	let x = $state(0);
	let y = $state(0);
	const middleware = $state(options.middleware ?? []);
	const transform = $state(options.transform ?? false);
	const refs = $state<UseFloatingReturn['refs']>({
		reference: options.elements?.reference,
		floating: options.elements?.floating
	});
	const styles = $derived.by<Partial<CSSStyleDeclaration>>(() => {
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
	// TODO: Fill context with actual context
	const context = $state<UseFloatingReturn['context']>(null);

	/** Functions */
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
	}

	/** Effects */
	$effect(() => {
		if (!refs.reference || !refs.floating) {
			return;
		}
		return autoUpdate(refs.reference, refs.floating, update);
	});

	return {
		get refs() {
			return refs;
		},
		get styles() {
			return styleObjectToString(styles);
		},
		get context() {
			return context;
		},
		get middlewareData() {
			return middlewareData;
		}
	};
}
