<script lang="ts" module>
	import { getAllContexts, mount, unmount, type Snippet } from "svelte";
	interface PortalProps {
		/**
		 * Where to portal the content to.
		 *
		 * @defaultValue document.body
		 */
		to?: HTMLElement | string | DocumentFragment;

		/**
		 * Disable portalling and render the component inline
		 *
		 * @defaultValue false
		 */
		disabled?: boolean;

		/**
		 * The children content to render within the portal.
		 */
		children?: Snippet;
	}

	export type { PortalProps };
</script>

<script lang="ts">
	import { DEV, BROWSER } from "esm-env";
	import PortalConsumer from "./portal-consumer.svelte";
	import { watch } from "../../internal/watch.svelte.js";

	let { to = "body", children, disabled }: PortalProps = $props();

	const context = getAllContexts();

	const target = $derived(getTarget());

	function getTarget() {
		if (!BROWSER || disabled) return null;
		let localTarget: HTMLElement | null | DocumentFragment | Element = null;
		if (typeof to === "string") {
			localTarget = document.querySelector(to);
			if (localTarget === null) {
				if (DEV) {
					throw new Error(`Target element "${to}" not found.`);
				}
			}
		} else if (
			to instanceof HTMLElement ||
			to instanceof DocumentFragment
		) {
			localTarget = to;
		} else {
			if (DEV) {
				throw new TypeError(
					`Unknown portal target type: ${
						to === null ? "null" : typeof to
					}. Allowed types: string (query selector), HTMLElement, or DocumentFragment.`
				);
			}
		}

		return localTarget;
	}

	let instance: any;

	function unmountInstance() {
		if (instance) {
			unmount(instance);
			instance = null;
		}
	}

	watch([() => target, () => disabled], ([target, disabled]) => {
		if (!target || disabled) {
			unmountInstance();
			return;
		}
		instance = mount(PortalConsumer, {
			target: target as any,
			props: { children },
			context,
		});

		return () => {
			unmountInstance();
		};
	});
</script>

{#if disabled}
	{@render children?.()}
{/if}
