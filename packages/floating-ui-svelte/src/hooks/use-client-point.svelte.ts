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
import { on } from "svelte/events";

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

class ClientPointInteraction implements ElementProps {
	#enabled = $derived.by(() => extract(this.options?.enabled, true));
	#axis = $derived.by(() => extract(this.options?.axis, "both"));
	#x = $derived.by(() => extract(this.options?.x, null));
	#y = $derived.by(() => extract(this.options?.y, null));
	#initial = false;
	#cleanupListener: (() => void) | null = null;
	#pointerType = $state<string | undefined>();
	#addListenerDeps = $state<number>(0);
	#openCheck = $derived.by(() =>
		isMouseLikePointerType(this.#pointerType)
			? this.context.floating
			: this.context.open,
	);

	constructor(
		private readonly context: FloatingContext,
		private readonly options: UseClientPointOptions = {},
	) {
		watch(
			() => this.#addListenerDeps,
			() => {
				return this.#addListener();
			},
		);

		watch([() => this.#enabled, () => this.context.floating], () => {
			if (this.#enabled && !this.context.floating) {
				this.#initial = false;
			}
		});

		watch([() => this.#enabled, () => this.context.floating], () => {
			if (!this.#enabled && this.context.open) {
				this.#initial = true;
			}
		});

		watch([() => this.#enabled, () => this.#x, () => this.#y], () => {
			if (this.#enabled && (this.#x != null || this.#y != null)) {
				this.#initial = false;
				this.#setReference(this.#x, this.#y);
			}
		});
	}

	#setReference = (x: number | null, y: number | null) => {
		if (this.#initial) return;

		// Prevent setting if the open event was not a mouse-like one
		// (e.g. focus to open, then hover over the reference element).
		// Only apply if the event exists.
		if (
			this.context.data.openEvent &&
			!isMouseBasedEvent(this.context.data.openEvent)
		) {
			return;
		}

		this.context.setPositionReference(
			createVirtualElement(this.context.domReference, {
				x,
				y,
				axis: this.#axis,
				data: this.context.data,
				pointerType: this.#pointerType,
			}),
		);
	};

	#handleReferenceEnterOrMove = (event: MouseEvent) => {
		if (this.#x != null || this.#y != null) return;

		if (!this.context.open) {
			this.#setReference(event.clientX, event.clientY);
		} else if (!this.#cleanupListener) {
			// If there's no cleanup, there's no listener, but we want to ensure
			// we add the listener if the cursor landed on the floating element and
			// then back on the reference (i.e. it's interactive).
			this.#addListenerDeps++;
		}
	};

	#addListener = () => {
		// Explicitly specified `x`/`y` coordinates shouldn't add a listener.
		if (
			!this.#openCheck ||
			!this.#enabled ||
			this.#x != null ||
			this.#y != null
		)
			return () => {};

		const win = getWindow(this.context.floating);

		const handleMouseMove = (event: MouseEvent) => {
			const target = getTarget(event) as Element | null;

			if (!contains(this.context.floating, target)) {
				this.#setReference(event.clientX, event.clientY);
			} else {
				this.#cleanupListener?.();
				this.#cleanupListener = null;
			}
		};

		if (
			!this.context.data.openEvent ||
			isMouseBasedEvent(this.context.data.openEvent)
		) {
			const removeListener = on(win, "mousemove", handleMouseMove);
			const cleanup = () => {
				removeListener();
				this.#cleanupListener = null;
			};
			this.#cleanupListener = cleanup;
			return cleanup;
		}

		this.context.setPositionReference(this.context.domReference);
	};

	#setPointerType = (event: PointerEvent) => {
		this.#pointerType = event.pointerType;
	};

	#reference = $derived.by(() => ({
		onpointerdown: this.#setPointerType,
		onpointerenter: this.#setPointerType,
		onmousemove: this.#handleReferenceEnterOrMove,
		onmouseenter: this.#handleReferenceEnterOrMove,
	}));

	get reference() {
		if (!this.#enabled) return {};
		return this.#reference;
	}
}

function useClientPoint(
	context: FloatingContext,
	options: UseClientPointOptions = {},
) {
	return new ClientPointInteraction(context, options);
}

export type { UseClientPointOptions };
export { useClientPoint, ClientPointInteraction };
