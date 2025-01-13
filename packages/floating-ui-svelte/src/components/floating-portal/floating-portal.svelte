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
	import type { Boxed } from "../../types.js";

	let {
		children,
		id,
		root = null,
		preserveTabOrder = true,
	}: FloatingPortalProps = $props();

	const portalNode = useFloatingPortalNode({
		id: () => id,
		root: () => root,
	});

	let focusManagerState = $state.raw<FocusManagerState>(null);
	let beforeOutsideRef = $state<Boxed<HTMLSpanElement | null>>({
		current: null,
	});
	let afterOutsideRef = $state<Boxed<HTMLSpanElement | null>>({
		current: null,
	});
	let beforeInsideRef = $state<Boxed<HTMLSpanElement | null>>({
		current: null,
	});
	let afterInsideRef = $state<Boxed<HTMLSpanElement | null>>({
		current: null,
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

	watch(
		[() => portalNode.current, () => preserveTabOrder, () => modal],
		([portalNode, preserveTabOrder, modal]) => {
			if (!portalNode || !preserveTabOrder || modal) return;

			// Make sure elements inside the portal element are tabbable only when the
			// portal has already been focused, either by tabbing into a focus trap
			// element outside or using the mouse.
			function onFocus(event: FocusEvent) {
				if (!portalNode || !isOutsideEvent(event)) return;

				const focusing = event.type === "focusin";
				const manageFocus = focusing
					? enableFocusInside
					: disableFocusInside;
				manageFocus(portalNode);
			}

			return executeCallbacks(
				on(portalNode, "focusin", onFocus, { capture: true }),
				on(portalNode, "focusout", onFocus, { capture: true })
			);
		}
	);

	watch([() => portalNode.current, () => open], ([portalNode, open]) => {
		if (!portalNode || open) return;

		enableFocusInside(portalNode);
	});

	PortalContext.set({
		get preserveTabOrder() {
			return preserveTabOrder;
		},
		beforeInsideRef,
		beforeOutsideRef,
		afterInsideRef,
		afterOutsideRef,
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
		data-type="outside"
		ref={beforeOutsideRef.current}
		onfocus={(event) => {
			if (isOutsideEvent(event, portalNode.current)) {
				beforeInsideRef.current?.focus();
			} else {
				const prevTabbable =
					getPreviousTabbable() || focusManagerState?.domReference;
				prevTabbable?.focus();
			}
		}} />

	<span aria-owns={portalNode.current.id} style={HIDDEN_STYLES_STRING}></span>
{/if}

{#if portalNode.current}
	<Portal to={portalNode.current} {children} />
{/if}

{#if shouldRenderGuards && portalNode.current}
	<FocusGuard
		data-type="outside"
		ref={afterOutsideRef.current}
		onfocus={(event) => {
			if (isOutsideEvent(event, portalNode.current)) {
				afterInsideRef.current?.focus();
			} else {
				const nextTabbable =
					getNextTabbable() || focusManagerState?.domReference;
				nextTabbable?.focus();

				focusManagerState?.closeOnFocusOut &&
					focusManagerState?.onOpenChange(false, event, "focus-out");
			}
		}} />
{/if}
