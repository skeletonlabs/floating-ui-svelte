<script lang="ts" module>
	import type { Snippet } from "svelte";
	import {
		type FocusManagerState,
		PortalContext,
		useFloatingPortalNode,
	} from "./hooks.svelte.js";
	import { watch } from "../../internal/watch.svelte.js";
	import {
		disableFocusInside,
		enableFocusInside,
		getNextTabbable,
		getPreviousTabbable,
		isOutsideEvent,
	} from "../../internal/tabbable.js";
	import { executeCallbacks } from "../../internal/execute-callbacks.js";
	import { on } from "svelte/events";
	import FocusGuard, { HIDDEN_STYLES_STRING } from "../focus-guard.svelte";

	interface FloatingPortalProps {
		children?: Snippet;
		/**
		 * Optionally selects the node with the id if it exists, or create it and
		 * append it to the specified `root` (by default `document.body`).
		 */
		id?: string;
		/**
		 * Specifies the root node the portal container will be appended to.
		 */
		root?: HTMLElement | null;
		/**
		 * When using non-modal focus management using `FloatingFocusManager`, this
		 * will preserve the tab order context based on the React tree instead of the
		 * DOM tree.
		 */
		preserveTabOrder?: boolean;
	}

	export type { FloatingPortalProps };
</script>

<script lang="ts">
	import Portal from "./portal.svelte";
	import { sleep } from "../../../test/internal/utils.js";

	let {
		children,
		id,
		root = typeof document === "undefined" ? null : document.body,
		preserveTabOrder = true,
	}: FloatingPortalProps = $props();

	const portalNode = useFloatingPortalNode({
		id: () => id,
		root: () => root,
	});

	let focusManagerState = $state.raw<FocusManagerState>(null);
	let beforeOutsideRef = $state<HTMLSpanElement | null>(null);
	let afterOutsideRef = $state<HTMLSpanElement | null>(null);
	let beforeInsideRef = $state<HTMLSpanElement | null>(null);
	let afterInsideRef = $state<HTMLSpanElement | null>(null);

	const modal = $derived(focusManagerState?.modal);
	const open = $derived(focusManagerState?.open);
	const shouldRenderGuards = $derived(
		// The FocusManager and therefore floating element are currently open/
		// rendered.
		!!focusManagerState &&
			// Guards are only for non-modal focus management.
			!focusManagerState.modal &&
			// Don't render if unmount is transitioning.
			focusManagerState.open &&
			preserveTabOrder &&
			!!(root || portalNode.current)
	);

	watch(
		[() => portalNode.current, () => preserveTabOrder, () => modal],
		() => {
			if (!portalNode.current || !preserveTabOrder || modal) return;

			// Make sure elements inside the portal element are tabbable only when the
			// portal has already been focused, either by tabbing into a focus trap
			// element outside or using the mouse.
			function onFocus(event: FocusEvent) {
				if (portalNode.current && isOutsideEvent(event)) {
					const focusing = event.type === "focusin";
					const manageFocus = focusing
						? enableFocusInside
						: disableFocusInside;

					manageFocus(portalNode.current);
				}
			}

			return executeCallbacks(
				on(portalNode.current, "focusin", onFocus, { capture: true }),
				on(portalNode.current, "focusout", onFocus, { capture: true })
			);
		}
	);

	watch([() => portalNode.current, () => open], () => {
		if (!portalNode.current || open) return;
		enableFocusInside(portalNode.current);
	});

	PortalContext.set({
		get preserveTabOrder() {
			return preserveTabOrder;
		},
		get beforeInsideRef() {
			return beforeInsideRef;
		},
		set beforeInsideRef(value: HTMLSpanElement | null) {
			beforeInsideRef = value;
		},
		get beforeOutsideRef() {
			return beforeOutsideRef;
		},
		get afterInsideRef() {
			return afterInsideRef;
		},
		set afterInsideRef(value: HTMLSpanElement | null) {
			afterInsideRef = value;
		},
		get afterOutsideRef() {
			return afterOutsideRef;
		},
		get portalNode() {
			return portalNode.current;
		},
		setFocusManagerState: (state) => {
			focusManagerState = state;
		},
	});
</script>

{#if shouldRenderGuards && portalNode.current}
	<FocusGuard
		type="outside"
		data-name="before"
		bind:ref={() => beforeOutsideRef, (v) => (beforeOutsideRef = v)}
		onfocus={(event) => {
			if (isOutsideEvent(event, portalNode.current)) {
				beforeInsideRef?.focus();
			} else {
				sleep().then(() => {
					const prevTabbable =
						getPreviousTabbable() ||
						focusManagerState?.domReference;
					prevTabbable?.focus();
				});
			}
		}} />
{/if}

{#if shouldRenderGuards && portalNode.current}
	<span aria-owns={portalNode.current.id} style={HIDDEN_STYLES_STRING}></span>
{/if}

{#if portalNode.current}
	<Portal to={portalNode.current} {children} />
{/if}

{#if shouldRenderGuards && portalNode.current}
	<FocusGuard
		type="outside"
		data-name="after"
		bind:ref={() => afterOutsideRef, (v) => (afterOutsideRef = v)}
		onfocus={(event) => {
			if (isOutsideEvent(event, portalNode.current)) {
				afterInsideRef?.focus();
			} else {
				sleep().then(() => {
					const nextTabbable =
						getNextTabbable() || focusManagerState?.domReference;

					nextTabbable?.focus();

					if (focusManagerState?.closeOnFocusOut) {
						focusManagerState?.onOpenChange(
							false,
							event,
							"focus-out"
						);
					}
				});
			}
		}} />
{/if}
