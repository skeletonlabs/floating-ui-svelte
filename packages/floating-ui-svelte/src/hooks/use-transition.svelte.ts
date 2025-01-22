import type { PropertiesHyphen } from "csstype";
import { extract } from "../internal/extract.js";
import { watch } from "../internal/watch.svelte.js";
import type { Boxed, Getter, MaybeGetter, ReferenceType } from "../types.js";
import type { FloatingContext } from "./use-floating.svelte.js";
import type { Placement, Side } from "@floating-ui/utils";
import { styleObjectToString } from "../internal/style-object-to-string.js";

function execWithArgsOrReturn<Value extends object | undefined, SidePlacement>(
	valueOrFn: Value | ((args: SidePlacement) => Value),
	args: SidePlacement,
): Value {
	return typeof valueOrFn === "function" ? valueOrFn(args) : valueOrFn;
}

type UseDelayUnmountOptions = {
	open: Getter<boolean>;
	durationMs: Getter<number>;
};

function useDelayUnmount(options: UseDelayUnmountOptions): Boxed<boolean> {
	const open = $derived(extract(options.open));
	const durationMs = $derived(extract(options.durationMs));

	let isMounted = $state(open);

	$effect(() => {
		if (open && !isMounted) {
			isMounted = true;
		}
	});

	$effect(() => {
		if (!open && isMounted) {
			const timeout = setTimeout(() => {
				isMounted = false;
			}, durationMs);
			return () => clearTimeout(timeout);
		}
	});

	return {
		get current() {
			return isMounted;
		},
	};
}

interface UseTransitionStatusOptions {
	/**
	 * The duration of the transition in milliseconds, or an object containing
	 * `open` and `close` keys for different durations.
	 */
	duration?: MaybeGetter<number | { open?: number; close?: number }>;
}
type TransitionStatus = "unmounted" | "initial" | "open" | "close";

/**
 * Provides a status string to apply CSS transitions to a floating element,
 * correctly handling placement-aware transitions.
 */
function useTransitionStatus(
	context: FloatingContext,
	opts: UseTransitionStatusOptions = {},
): { isMounted: boolean; status: TransitionStatus } {
	const duration = $derived(extract(opts.duration, 250));
	const closeDuration = $derived.by(() => {
		if (typeof duration === "number") {
			return duration;
		}
		return duration.close || 0;
	});
	let status: TransitionStatus = $state("unmounted");
	const isMounted = useDelayUnmount({
		open: () => context.open,
		durationMs: () => closeDuration,
	});

	$effect.pre(() => {
		if (!isMounted.current && status === "close") {
			status = "unmounted";
		}
	});

	watch.pre([() => context.open, () => context.floating], () => {
		if (!context.floating) return;

		if (context.open) {
			status = "initial";

			const frame = requestAnimationFrame(() => {
				status = "open";
			});

			return () => {
				cancelAnimationFrame(frame);
			};
		}

		status = "close";
	});

	return {
		get isMounted() {
			return isMounted.current;
		},
		get status() {
			return status;
		},
	};
}

type CSSStylesProperty =
	| PropertiesHyphen
	| ((params: { side: Side; placement: Placement }) => PropertiesHyphen);

interface UseTransitionStylesOptions extends UseTransitionStatusOptions {
	/**
	 * The styles to apply when the floating element is initially mounted.
	 */
	initial?: CSSStylesProperty;
	/**
	 * The styles to apply when the floating element is transitioning to the
	 * `open` state.
	 */
	open?: CSSStylesProperty;
	/**
	 * The styles to apply when the floating element is transitioning to the
	 * `close` state.
	 */
	close?: CSSStylesProperty;
	/**
	 * The styles to apply to all states.
	 */
	common?: CSSStylesProperty;
}

function useTransitionStyles(
	context: FloatingContext,
	opts: UseTransitionStylesOptions = {},
): {
	styles: string;
	isMounted: boolean;
} {
	const initial = $derived(opts.initial ?? { opacity: 0 });
	const open = $derived(opts.open);
	const close = $derived(opts.close);
	const common = $derived(opts.common);
	const duration = $derived(extract(opts.duration, 250));
	const placement = $derived(context.placement);
	const side = $derived(placement.split("-")[0] as Side);
	const fnArgs = $derived({ side, placement });
	const openDuration = $derived.by(() => {
		if (typeof duration === "number") {
			return duration;
		}
		return duration.open || 0;
	});
	const closeDuration = $derived.by(() => {
		if (typeof duration === "number") {
			return duration;
		}
		return duration.close || 0;
	});
	let styles = $state.raw<PropertiesHyphen>({
		...execWithArgsOrReturn(common, fnArgs),
		...execWithArgsOrReturn(initial, fnArgs),
	});
	const transitionStatus = useTransitionStatus(context, {
		duration: opts.duration,
	});
	const status = $derived(transitionStatus.status);

	watch.pre(
		[
			() => closeDuration,
			() => close,
			() => initial,
			() => open,
			() => common,
			() => openDuration,
			() => status,
			() => fnArgs,
		],
		() => {
			const initialStyles = execWithArgsOrReturn(initial, fnArgs);
			const closeStyles = execWithArgsOrReturn(close, fnArgs);
			const commonStyles = execWithArgsOrReturn(common, fnArgs);
			const openStyles =
				execWithArgsOrReturn(open, fnArgs) ||
				Object.keys(initialStyles).reduce((acc: Record<string, "">, key) => {
					acc[key] = "";
					return acc;
				}, {});

			if (status === "initial") {
				styles = {
					"transition-property": styles["transition-property"],
					...commonStyles,
					...initialStyles,
				};
			}

			if (status === "open") {
				styles = {
					"transition-property": Object.keys(openStyles).join(", "),
					"transition-duration": `${openDuration}ms`,
					...commonStyles,
					...openStyles,
				};
			}

			if (status === "close") {
				const localStyles = closeStyles || initialStyles;
				styles = {
					"transition-property": Object.keys(localStyles).join(", "),
					"transition-duration": `${closeDuration}ms`,
					...commonStyles,
					...localStyles,
				};
			}
		},
	);

	return {
		get styles() {
			return styleObjectToString(styles);
		},

		get isMounted() {
			return transitionStatus.isMounted;
		},
	};
}

export { useTransitionStyles, useTransitionStatus };
export type { UseTransitionStatusOptions, UseTransitionStylesOptions };
