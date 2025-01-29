import { getWindow } from "@floating-ui/utils/dom";
import {
	contains,
	getTarget,
	isMouseLikePointerType,
} from "../internal/dom.js";
import { extract } from "../internal/extract.js";
import type { ContextData, MaybeGetter } from "../types.js";
import type { FloatingContext } from "./use-floating.svelte.js";
import type { ElementProps } from "./use-interactions.svelte.js";
import { watch } from "../internal/watch.svelte.js";

function createVirtualElement(
	domElement: Element | null | undefined,
	data: {
		axis: "x" | "y" | "both";
		data: ContextData;
		pointerType: string | undefined;
		x: number | null;
		y: number | null;
	},
) {
	let offsetX: number | null = null;
	let offsetY: number | null = null;
	let isAutoUpdateEvent = false;

	return {
		contextElement: domElement || undefined,
		getBoundingClientRect() {
			const domRect = domElement?.getBoundingClientRect() || {
				width: 0,
				height: 0,
				x: 0,
				y: 0,
			};

			const isXAxis = data.axis === "x" || data.axis === "both";
			const isYAxis = data.axis === "y" || data.axis === "both";
			const canTrackCursorOnAutoUpdate =
				["mouseenter", "mousemove"].includes(data.data.openEvent?.type || "") &&
				data.pointerType !== "touch";

			let width = domRect.width;
			let height = domRect.height;
			let x = domRect.x;
			let y = domRect.y;

			if (offsetX == null && data.x && isXAxis) {
				offsetX = domRect.x - data.x;
			}

			if (offsetY == null && data.y && isYAxis) {
				offsetY = domRect.y - data.y;
			}

			x -= offsetX || 0;
			y -= offsetY || 0;
			width = 0;
			height = 0;

			if (!isAutoUpdateEvent || canTrackCursorOnAutoUpdate) {
				width = data.axis === "y" ? domRect.width : 0;
				height = data.axis === "x" ? domRect.height : 0;
				x = isXAxis && data.x != null ? data.x : x;
				y = isYAxis && data.y != null ? data.y : y;
			} else if (isAutoUpdateEvent && !canTrackCursorOnAutoUpdate) {
				height = data.axis === "x" ? domRect.height : height;
				width = data.axis === "y" ? domRect.width : width;
			}

			isAutoUpdateEvent = true;

			return {
				width,
				height,
				x,
				y,
				top: y,
				right: x + width,
				bottom: y + height,
				left: x,
			};
		},
	};
}

function isMouseBasedEvent(event: Event | undefined): event is MouseEvent {
	return event != null && (event as MouseEvent).clientX != null;
}

interface UseClientPointOptions {
	/**
	 * Whether the Hook is enabled, including all internal Effects and event
	 * handlers.
	 * @default true
	 */
	enabled?: MaybeGetter<boolean>;
	/**
	 * Whether to restrict the client point to an axis and use the reference
	 * element (if it exists) as the other axis. This can be useful if the
	 * floating element is also interactive.
	 * @default 'both'
	 */
	axis?: MaybeGetter<"x" | "y" | "both">;
	/**
	 * An explicitly defined `x` client coordinate.
	 * @default null
	 */
	x?: MaybeGetter<number | null>;
	/**
	 * An explicitly defined `y` client coordinate.
	 * @default null
	 */
	y?: MaybeGetter<number | null>;
}

function useClientPoint(
	context: FloatingContext,
	opts: UseClientPointOptions = {},
): ElementProps {
	const enabled = $derived(extract(opts.enabled, true));
	const axis = $derived(extract(opts.axis, "both"));
	const x = $derived(extract(opts.x, null));
	const y = $derived(extract(opts.y, null));
	let initial = false;
	let cleanupListener: (() => void) | null = null;
	let pointerType = $state<string | undefined>();
	let listenerDeps = $state.raw<never[]>([]);

	// If the pointer is a mouse-like pointer, we want to continue following the
	// mouse even if the floating element is transitioning out. On touch
	// devices, this is undesirable because the floating element will move to
	// the dismissal touch point.
	const openCheck = $derived(
		isMouseLikePointerType(pointerType) ? context.floating : context.open,
	);

	function setReference(x: number | null, y: number | null) {
		if (initial) return;

		// Prevent setting if the open event was not a mouse-like one
		// (e.g. focus to open, then hover over the reference element).
		// Only apply if the event exists.
		if (context.data.openEvent && !isMouseBasedEvent(context.data.openEvent)) {
			return;
		}

		context.setPositionReference(
			createVirtualElement(context.domReference, {
				x,
				y,
				axis: axis,
				data: context.data,
				pointerType: pointerType,
			}),
		);
	}

	function handleReferenceEnterOrMove(event: MouseEvent) {
		if (x != null || y != null) return;

		if (!context.open) {
			setReference(event.clientX, event.clientY);
		} else if (!cleanupListener) {
			// If there's no cleanup, there's no listener, but we want to ensure
			// we add the listener if the cursor landed on the floating element and
			// then back on the reference (i.e. it's interactive).
			listenerDeps = [];
		}
	}

	function addListener() {
		if (!openCheck || !enabled || x != null || y != null) {
			// Clear existing listener when conditions change
			if (cleanupListener) {
				cleanupListener();
				cleanupListener = null;
			}
			return;
		}

		// Clear existing listener before adding new one
		if (cleanupListener) {
			cleanupListener();
			cleanupListener = null;
		}

		const win = getWindow(context.floating);

		const handleMouseMove = (event: MouseEvent) => {
			const target = getTarget(event) as Element | null;
			if (!contains(context.floating, target)) {
				setReference(event.clientX, event.clientY);
			} else {
				win.removeEventListener("mousemove", handleMouseMove);
				cleanupListener = null;
			}
		};

		if (!context.data.openEvent || isMouseBasedEvent(context.data.openEvent)) {
			win.addEventListener("mousemove", handleMouseMove);
			const cleanup = () => {
				win.removeEventListener("mousemove", handleMouseMove);
				cleanupListener = null;
			};
			cleanupListener = cleanup;
			return cleanup;
		}

		context.setPositionReference(context.domReference);
	}

	function setPointerType(event: PointerEvent) {
		pointerType = event.pointerType;
	}

	watch(
		() => listenerDeps,
		() => {
			return addListener();
		},
	);

	$effect(() => {
		if (enabled && !context.floating) {
			initial = false;
		}
	});

	$effect(() => {
		if (!enabled && context.open) {
			initial = true;
		}
	});

	$effect.pre(() => {
		if (enabled && (x != null || y != null)) {
			initial = false;
			setReference(x, y);
		}
	});

	$effect(() => {
		if (enabled && context.open) {
			listenerDeps = [];
		}
	});

	$effect(() => {
		if (!openCheck && cleanupListener) {
			cleanupListener();
		}
	});

	const reference = $derived({
		onpointerdown: setPointerType,
		onpointerenter: setPointerType,
		onmousemove: handleReferenceEnterOrMove,
		onmouseenter: handleReferenceEnterOrMove,
	});

	return {
		get reference() {
			if (!enabled) return {};
			return reference;
		},
	};
}

export type { UseClientPointOptions };
export { useClientPoint };
