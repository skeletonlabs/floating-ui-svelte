import {
	type ComputePositionConfig,
	type Middleware,
	type MiddlewareData,
	type Placement,
	type Strategy,
	computePosition,
} from "@floating-ui/dom";
import { getDPR, roundByDPR } from "../internal/dpr.js";
import { styleObjectToString } from "../internal/style-object-to-string.js";
import type { Boxed, ReferenceType } from "../types.js";
import type { PropertiesHyphen } from "csstype";
import type { FloatingRootContext } from "./use-floating-root-context.svelte.js";
import type { FloatingOptions } from "./use-floating-options.svelte.js";

interface UsePositionData {
	/**
	 * The x-coordinate of the floating element.
	 */
	x: number;

	/**
	 * The y-coordinate of the floating element.
	 */
	y: number;

	/**
	 * The stateful placement, which can be different from the initial `placement` passed as options.
	 */
	placement: Placement;

	/**
	 * The stateful strategy, which can be different from the initial `strategy` passed as options.
	 */
	strategy: Strategy;

	/**
	 * Additional data from middleware.
	 */
	middlewareData: MiddlewareData;

	/**
	 * The boolean that let you know if the floating element has been positioned.
	 */
	isPositioned: boolean;
}

export interface PositionState<RT extends ReferenceType = ReferenceType>
	extends ReturnType<typeof usePosition<RT>> {}

/**
 * Manages the positioning of floating elements.
 */
export function usePosition<RT extends ReferenceType = ReferenceType>(
	opts: FloatingOptions<RT>,
	rootContext: FloatingRootContext<RT>,
	getPositionReference: () => RT | null,
) {
	const referenceEl = $derived(
		getPositionReference() || opts.reference.current || null,
	);
	const data: UsePositionData = $state({
		x: 0,
		y: 0,
		strategy: opts.strategy.current,
		placement: opts.placement.current,
		middlewareData: {},
		isPositioned: false,
	});

	let floatingPointerEvents = $state.raw<
		Boxed<PropertiesHyphen["pointer-events"] | undefined>
	>({ current: undefined });

	function setFloatingPointerEvents(
		pointerEvents: PropertiesHyphen["pointer-events"] | undefined,
	) {
		floatingPointerEvents = { current: pointerEvents };
	}

	const floatingStyles = $derived.by(() => {
		const pointerEvents = $state.snapshot(floatingPointerEvents);
		const initialStyles: PropertiesHyphen = {
			position: opts.strategy.current,
			left: "0px",
			top: "0px",
			...(pointerEvents.current && {
				"pointer-events": pointerEvents.current,
			}),
		};

		if (!opts.floating.current) {
			return styleObjectToString(initialStyles);
		}

		const x = roundByDPR(opts.floating.current, data.x);
		const y = roundByDPR(opts.floating.current, data.y);

		if (opts.transform.current) {
			return styleObjectToString({
				...initialStyles,
				transform: `translate(${x}px, ${y}px)`,
				...(getDPR(opts.floating.current) >= 1.5 && {
					willChange: "transform",
				}),
			});
		}

		return styleObjectToString({
			position: opts.strategy.current,
			left: `${x}px`,
			top: `${y}px`,
			...(pointerEvents.current && {
				"pointer-events": pointerEvents.current,
			}),
		});
	});

	async function update() {
		if (!referenceEl || !opts.floating.current) return;

		const config: ComputePositionConfig = {
			placement: opts.placement.current,
			strategy: opts.strategy.current,
			middleware: opts.middleware.current,
		};

		const position = await computePosition(
			referenceEl,
			opts.floating.current,
			config,
		);

		data.x = position.x;
		data.y = position.y;
		data.placement = position.placement;
		data.strategy = position.strategy;
		data.middlewareData = position.middlewareData;
		data.isPositioned = rootContext.open !== false;
	}

	$effect.pre(() => {
		if (rootContext.open || !data.isPositioned) return;
		data.isPositioned = false;
	});

	$effect.pre(() => {
		if (referenceEl && opts.floating.current) {
			if (opts?.whileElementsMounted) {
				return opts.whileElementsMounted(
					referenceEl,
					opts.floating.current,
					update,
				);
			}

			update();
		}
	});

	return {
		get referenceEl() {
			return referenceEl;
		},
		data,
		setFloatingPointerEvents,
		get floatingStyles() {
			return floatingStyles;
		},
		update,
	};
}

export type { UsePositionData };
