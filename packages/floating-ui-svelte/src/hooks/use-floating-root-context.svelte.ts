import type { ReferenceElement } from "@floating-ui/dom";
import type {
	ContextData,
	MaybeGetter,
	OpenChangeReason,
	ReferenceType,
} from "../types.js";
import { useId } from "./use-id.js";
import { createPubSub } from "../internal/create-pub-sub.js";
import { useFloatingParentNodeId } from "../components/floating-tree/hooks.svelte.js";
import { DEV } from "esm-env";
import { isElement } from "@floating-ui/utils/dom";
import { error } from "../internal/log.js";
import {
	box,
	type ReadableBox,
	type WritableBox,
} from "../internal/box.svelte.js";
import { extract } from "../internal/extract.js";
import { noop } from "../internal/noop.js";

interface UseFloatingRootContextOptions {
	open?: MaybeGetter<boolean>;
	onOpenChange?: (
		open: boolean,
		event?: Event,
		reason?: OpenChangeReason,
	) => void;
	reference: MaybeGetter<Element | null>;
	floating: MaybeGetter<HTMLElement | null>;
	onReferenceChange?: (node: Element | null) => void;
	onFloatingChange?: (node: HTMLElement | null) => void;
}

class FloatingRootContextOptions {
	open: ReadableBox<boolean>;
	onOpenChange: (
		open: boolean,
		event?: Event,
		reason?: OpenChangeReason,
	) => void;
	onReferenceChange: (node: Element | null) => void;
	onFloatingChange: (node: HTMLElement | null) => void;
	#stableReference = $state<Element | null>(null);
	#stableFloating = $state<HTMLElement | null>(null);
	reference: WritableBox<Element | null>;
	floating: WritableBox<HTMLElement | null>;
	floatingProp = $derived.by(() => extract(this.options.floating, null));
	referenceProp = $derived.by(() => extract(this.options.reference, null));

	constructor(readonly options: UseFloatingRootContextOptions) {
		this.open = box.with(() => extract(options.open, false));
		this.onOpenChange = options.onOpenChange ?? noop;
		this.onReferenceChange = options.onReferenceChange ?? noop;
		this.onFloatingChange = options.onFloatingChange ?? noop;
		this.reference = box.with(
			() => this.#stableReference,
			(node) => {
				this.#stableReference = node;
				this.onReferenceChange(node as Element | null);
			},
		);
		this.floating = box.with(
			() => this.#stableFloating,
			(node) => {
				this.#stableFloating = node;
				this.onFloatingChange(node);
			},
		);

		this.reference.current = this.referenceProp;
		this.floating.current = this.floatingProp;

		$effect.pre(() => {
			this.reference.current = this.referenceProp;
		});

		$effect.pre(() => {
			this.floating.current = this.floatingProp;
		});
	}
}

class FloatingRootContext<RT extends ReferenceType = ReferenceType> {
	floatingId = useId();
	data: ContextData<RT> = $state({});
	events = createPubSub();
	open = $derived.by(() => this.options.open.current);
	/** Whether the floating element is nested inside another floating element. */
	#nested: boolean;
	/** Enables the user to specify a position reference after initialization. */
	#positionReference = $state<ReferenceElement | null>(null);
	reference = $derived.by(
		() =>
			(this.#positionReference ||
				this.options.reference.current ||
				null) as RT | null,
	);
	floating = $derived.by(() => this.options.floating.current);
	domReference = $derived.by(() => this.options.reference.current);

	constructor(private readonly options: FloatingRootContextOptions) {
		this.#nested = useFloatingParentNodeId() != null;

		if (DEV) {
			if (options.reference.current && !isElement(options.reference.current)) {
				error(
					"Cannot pass a virtual element to the `elements.reference` option,",
					"as it must be a real DOM element. Use `floating.setPositionReference()`",
					"instead.",
				);
			}
		}
		this.#positionReference = this.options.reference.current;
		this.onOpenChange = this.onOpenChange.bind(this);
	}

	onOpenChange(open: boolean, event?: Event, reason?: OpenChangeReason) {
		this.data.openEvent = open ? event : undefined;
		this.events.emit("openchange", {
			open,
			event,
			reason,
			nested: this.#nested,
		});
		this.options.onOpenChange?.(open, event, reason);
	}

	setPositionReference(node: ReferenceElement | null) {
		this.#positionReference = node;
	}
}

export function useFloatingRootContext(options: UseFloatingRootContextOptions) {
	const optionsState = new FloatingRootContextOptions(options);
	return new FloatingRootContext(optionsState);
}

export type { UseFloatingRootContextOptions };
export { FloatingRootContext };
