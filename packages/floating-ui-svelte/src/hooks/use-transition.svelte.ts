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

class TransitionStatusState {
	#duration = $derived.by(() => extract(this.options.duration, 250));
	#closeDuration = $derived.by(() => {
		if (typeof this.#duration === "number") {
			return this.#duration;
		}
		return this.#duration.close || 0;
	});
	#status: TransitionStatus = $state("unmounted");
	#isMounted: ReturnType<typeof useDelayUnmount>;

	constructor(
		private readonly context: FloatingContext,
		private readonly options: UseTransitionStatusOptions,
	) {
		this.#isMounted = useDelayUnmount({
			open: () => this.context.open,
			durationMs: () => this.#closeDuration,
		});

		$effect.pre(() => {
			if (!this.#isMounted.current && this.#status === "close") {
				this.#status = "unmounted";
			}
		});

		watch.pre([() => this.context.open, () => this.context.floating], () => {
			if (!this.context.floating) return;

			if (this.context.open) {
				this.#status = "initial";

				const frame = requestAnimationFrame(() => {
					this.#status = "open";
				});

				return () => {
					cancelAnimationFrame(frame);
				};
			}

			this.#status = "close";
		});
	}

	get isMounted() {
		return this.#isMounted.current;
	}

	get status() {
		return this.#status;
	}
}

/**
 * Provides a status string to apply CSS transitions to a floating element,
 * correctly handling placement-aware transitions.
 */
function useTransitionStatus(
	context: FloatingContext,
	options: UseTransitionStatusOptions = {},
): TransitionStatusState {
	return new TransitionStatusState(context, options);
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

class TransitionStylesState<RT extends ReferenceType = ReferenceType> {
	#initial = $derived.by(() => this.options.initial ?? { opacity: 0 });
	#open = $derived.by(() => this.options.open);
	#close = $derived.by(() => this.options.close);
	#common = $derived.by(() => this.options.common);
	#duration = $derived.by(() => extract(this.options.duration, 250));
	#placement = $derived.by(() => this.context.placement);
	#side = $derived.by(() => this.#placement.split("-")[0] as Side);
	#fnArgs = $derived.by(() => ({
		side: this.#side,
		placement: this.#placement,
	}));
	#openDuration = $derived.by(() => {
		if (typeof this.#duration === "number") {
			return this.#duration;
		}
		return this.#duration.open || 0;
	});
	#closeDuration = $derived.by(() => {
		if (typeof this.#duration === "number") {
			return this.#duration;
		}
		return this.#duration.close || 0;
	});
	#styles = $state.raw<PropertiesHyphen>({});
	#transitionStatus: TransitionStatusState;
	#status = $derived.by(() => this.#transitionStatus.status);

	constructor(
		private readonly context: FloatingContext<RT>,
		private readonly options: UseTransitionStylesOptions = {},
	) {
		this.#styles = {
			...execWithArgsOrReturn(this.#common, this.#fnArgs),
			...execWithArgsOrReturn(this.#initial, this.#fnArgs),
		};
		this.#transitionStatus = useTransitionStatus(context, {
			duration: this.options.duration,
		});

		watch.pre(
			[
				() => this.#closeDuration,
				() => this.#close,
				() => this.#initial,
				() => this.#open,
				() => this.#common,
				() => this.#openDuration,
				() => this.#status,
				() => this.#fnArgs,
			],
			() => {
				const initialStyles = execWithArgsOrReturn(this.#initial, this.#fnArgs);
				const closeStyles = execWithArgsOrReturn(this.#close, this.#fnArgs);
				const commonStyles = execWithArgsOrReturn(this.#common, this.#fnArgs);
				const openStyles =
					execWithArgsOrReturn(this.#open, this.#fnArgs) ||
					Object.keys(initialStyles).reduce((acc: Record<string, "">, key) => {
						acc[key] = "";
						return acc;
					}, {});

				if (this.#status === "initial") {
					this.#styles = {
						"transition-property": this.#styles["transition-property"],
						...commonStyles,
						...initialStyles,
					};
				}

				if (this.#status === "open") {
					this.#styles = {
						"transition-property": Object.keys(openStyles).join(", "),
						"transition-duration": `${this.#openDuration}ms`,
						...commonStyles,
						...openStyles,
					};
				}

				if (this.#status === "close") {
					const localStyles = closeStyles || initialStyles;
					this.#styles = {
						"transition-property": Object.keys(localStyles).join(", "),
						"transition-duration": `${this.#closeDuration}ms`,
						...commonStyles,
						...localStyles,
					};
				}
			},
		);
	}

	get styles() {
		return styleObjectToString(this.#styles);
	}

	get isMounted() {
		return this.#transitionStatus.isMounted;
	}
}

function useTransitionStyles(
	context: FloatingContext,
	options: UseTransitionStylesOptions = {},
): TransitionStylesState {
	return new TransitionStylesState(context, options);
}

export { useTransitionStyles, useTransitionStatus };
export type { UseTransitionStatusOptions, UseTransitionStylesOptions };
