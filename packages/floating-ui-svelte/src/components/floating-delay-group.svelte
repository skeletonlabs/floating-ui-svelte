<script lang="ts" module>
	import type { Snippet } from "svelte";
	import { watch } from "../internal/watch.svelte.js";
	import {
		box,
		type ReadableBox,
		type WritableBox,
	} from "../internal/box.svelte.js";
	import { Context } from "../internal/context.js";
	import type { MaybeGetter } from "../types.js";
	import { extract } from "../internal/extract.js";
	import { getDelay } from "../hooks/use-hover.svelte.js";
	import type { FloatingContext } from "../hooks/use-floating.svelte.js";
	import type { FloatingRootContext } from "../hooks/use-floating-root-context.svelte.js";

	type Delay = number | Partial<{ open: number; close: number }>;

	interface DelayGroupStateOptions {
		timeoutMs: WritableBox<number>;
		delay: WritableBox<Delay>;
		initialDelay: ReadableBox<Delay>;
	}

	class DelayGroupState {
		#delay = box<Delay>(0);
		#initialDelay = box.with<Delay>(() => 0);
		#timeoutMs = box(0);
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		currentId: any = $state(null);
		isInstantPhase: boolean = $state(false);

		constructor(options?: DelayGroupStateOptions) {
			if (options) {
				this.#delay = options.delay;
				this.#initialDelay = options.initialDelay;
				this.#timeoutMs = options.timeoutMs;
			}
		}

		get delay() {
			return this.#delay.current;
		}

		set delay(value: Delay) {
			this.#delay.current = value;
		}

		get initialDelay() {
			return this.#initialDelay.current;
		}

		get timeoutMs() {
			return this.#timeoutMs.current;
		}

		set timeoutMs(value: number) {
			this.#timeoutMs.current = value;
		}
	}

	const FloatingDelayGroupContext = new Context<DelayGroupState>(
		"FloatingDelayGroup"
	);

	interface UseDelayGroupOptions {
		/**
		 * Whether delay grouping should be enabled.
		 * @default true
		 */
		enabled?: MaybeGetter<boolean>;

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		id?: MaybeGetter<any>;
	}

	function useDelayGroupContext(): DelayGroupState {
		return FloatingDelayGroupContext.getOr(new DelayGroupState());
	}

	/**
	 * Enables grouping when called inside a component that's a child of a
	 * `FloatingDelayGroup`.
	 * @see https://floating-ui-svelte.vercel.app/docs/FloatingDelayGroup
	 */
	function useDelayGroup(
		context: FloatingContext | FloatingRootContext,
		options: UseDelayGroupOptions = {}
	): DelayGroupState {
		const enabled = $derived.by(() => extract(options.enabled, true));
		const id = $derived.by(() => extract(options.id) ?? context.floatingId);
		const groupContext = useDelayGroupContext();

		watch.pre(
			[
				() => enabled,
				() => id,
				() => groupContext.currentId,
				() => groupContext.initialDelay,
			],
			() => {
				if (!enabled || !groupContext.currentId) return;

				groupContext.delay = {
					open: 1,
					close: getDelay(groupContext.initialDelay, "close"),
				};

				if (groupContext.currentId !== id) {
					context.onOpenChange(false);
				}
			}
		);

		watch.pre(
			[
				() => enabled,
				() => context.open,
				() => groupContext.currentId,
				() => id,
				() => groupContext.initialDelay,
				() => groupContext.timeoutMs,
			],
			() => {
				const unset = () => {
					context.onOpenChange(false);
					groupContext.delay = groupContext.initialDelay;
					groupContext.currentId = null;
				};

				if (!enabled || !groupContext.currentId) return;

				if (!context.open && groupContext.currentId === id) {
					if (groupContext.timeoutMs) {
						const timeout = window.setTimeout(
							unset,
							groupContext.timeoutMs
						);
						return () => {
							window.clearTimeout(timeout);
						};
					}

					unset();
				}
			}
		);

		watch.pre([() => enabled, () => context.open, () => id], () => {
			if (!enabled || !context.open) return;
			groupContext.currentId = id;
		});

		return groupContext;
	}

	interface FloatingDelayGroupProps {
		children?: Snippet;
		/**
		 * The delay to use for the group.
		 */
		delay: Delay;
		/**
		 * An optional explicit timeout to use for the group, which represents when
		 * grouping logic will no longer be active after the close delay completes.
		 * This is useful if you want grouping to “last” longer than the close delay,
		 * for example if there is no close delay at all.
		 */
		timeoutMs?: number;
	}

	export type { FloatingDelayGroupProps, UseDelayGroupOptions };
	export { useDelayGroup };
</script>

<script lang="ts">
	let { children, delay, timeoutMs = 0 }: FloatingDelayGroupProps = $props();

	let initialCurrentId: any = null;
	let stableDelay = $state(delay);
	let stableInitialDelay = $state(delay);

	watch.pre(
		() => delay,
		() => {
			stableDelay = delay;
			stableInitialDelay = delay;
		}
	);

	const delayGroupState = new DelayGroupState({
		delay: box.with(
			() => stableDelay,
			(v) => (stableDelay = v)
		),
		timeoutMs: box.with(
			() => timeoutMs,
			(v) => (timeoutMs = v)
		),
		initialDelay: box.with(() => stableInitialDelay),
	});

	watch.pre(
		[() => delayGroupState.currentId, () => delayGroupState.isInstantPhase],
		() => {
			if (delayGroupState.currentId) {
				if (initialCurrentId === null) {
					initialCurrentId = delayGroupState.currentId;
				} else if (!delayGroupState.isInstantPhase) {
					delayGroupState.isInstantPhase = true;
				}
			} else {
				if (delayGroupState.isInstantPhase) {
					delayGroupState.isInstantPhase = false;
				}
				initialCurrentId = null;
			}
		}
	);

	FloatingDelayGroupContext.set(delayGroupState);
</script>

{@render children?.()}
