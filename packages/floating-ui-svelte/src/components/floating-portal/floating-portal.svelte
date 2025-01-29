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
	import { handleGuardFocus } from "../../internal/handle-guard-focus.js";
	import { FLOATING_ID_ATTRIBUTE } from "../../internal/attributes.js";
	import { afterSleep } from "../../internal/after-sleep.js";

	let {
		children,
		id,
		root,
		preserveTabOrder = true,
	}: FloatingPortalProps = $props();

	let focusManagerState = $state.raw<FocusManagerState>(null);
	let beforeOutsideGuard = $state<HTMLSpanElement | null>(null);
	let afterOutsideGuard = $state<HTMLSpanElement | null>(null);
	let beforeInsideGuard = $state<HTMLSpanElement | null>(null);
	let afterInsideGuard = $state<HTMLSpanElement | null>(null);
	let portalOriginMarker = $state<HTMLSpanElement | null>(null);
	let originFloatingId = $state<string | null>(null);

	const portalNode = useFloatingPortalNode({
		id: () => id,
		root: () => root,
		originFloatingId: () => originFloatingId,
	});

	$effect(() => {
		if (!portalOriginMarker) {
			originFloatingId = null;
			return;
		}
		const closestFloatingNode = portalOriginMarker.closest(
			`[${FLOATING_ID_ATTRIBUTE}]`
		);
		if (closestFloatingNode) {
			originFloatingId = closestFloatingNode.getAttribute(
				FLOATING_ID_ATTRIBUTE
			);
		} else {
			originFloatingId = null;
		}
	});

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

	$effect.pre(() => {
		if (!portalNode.current || !preserveTabOrder || modal) return;
		return executeCallbacks(
			on(portalNode.current, "focusin", onFocus, { capture: true }),
			on(portalNode.current, "focusout", onFocus, { capture: true })
		);
	});

	$effect.pre(() => {
		if (!portalNode.current || open) return;
		enableFocusInside(portalNode.current);
	});

	PortalContext.set({
		get preserveTabOrder() {
			return preserveTabOrder;
		},
		get beforeInsideGuard() {
			return beforeInsideGuard;
		},
		set beforeInsideGuard(value: HTMLSpanElement | null) {
			beforeInsideGuard = value;
		},
		get beforeOutsideGuard() {
			return beforeOutsideGuard;
		},
		get afterInsideGuard() {
			return afterInsideGuard;
		},
		set afterInsideGuard(value: HTMLSpanElement | null) {
			afterInsideGuard = value;
		},
		get afterOutsideGuard() {
			return afterOutsideGuard;
		},
		get portalNode() {
			return portalNode.current;
		},
		setFocusManagerState: (state) => {
			focusManagerState = state;
		},
	});
</script>

<span
	data-floating-ui-portal-origin
	bind:this={portalOriginMarker}
	style="display: none !important;"></span>

{#if shouldRenderGuards && portalNode.current}
	<FocusGuard
		type="outside"
		data-name="before"
		bind:ref={() => beforeOutsideGuard, (v) => (beforeOutsideGuard = v)}
		onfocus={(event) => {
			if (isOutsideEvent(event, portalNode.current)) {
				handleGuardFocus(beforeInsideGuard);
			} else {
				afterSleep(0, () => {
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
		bind:ref={() => afterOutsideGuard, (v) => (afterOutsideGuard = v)}
		onfocus={(event) => {
			if (isOutsideEvent(event, portalNode.current)) {
				handleGuardFocus(afterInsideGuard);
			} else {
				afterSleep(0, () => {
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
