import type { ReferenceElement } from "@floating-ui/dom";
import type {
	ContextData,
	OnOpenChange,
	OpenChangeReason,
	ReferenceType,
} from "../types.js";
import { useId } from "./use-id.js";
import { createPubSub } from "../internal/create-pub-sub.js";
import { useFloatingParentNodeId } from "../components/floating-tree/hooks.svelte.js";
import { DEV } from "esm-env";
import { isElement } from "@floating-ui/utils/dom";
import { error } from "../internal/log.js";

interface UseFloatingRootContextOptions {
	open?: boolean;
	onOpenChange?: (
		open: boolean,
		event?: Event,
		reason?: OpenChangeReason,
	) => void;
	elements: {
		reference: Element | null;
		floating: HTMLElement | null;
	};
}

class FloatingRootContext<RT extends ReferenceType = ReferenceType> {
	floatingId = useId();
	data: ContextData<RT> = $state({});
	events = createPubSub();
	open = $derived.by(() => this.options.open ?? false);

	/** Whether the floating element is nested inside another floating element. */
	#nested: boolean;
	/** Enables the user to specify a position reference after initialization. */
	#positionReference = $state<ReferenceElement | null>(null);
	#referenceElement = $state<Element | null>(null);
	#floatingElement = $state<HTMLElement | null>(null);

	#elements = $derived.by(() => ({
		reference: (this.#positionReference ||
			this.#referenceElement ||
			null) as RT | null,
		floating: this.#floatingElement || null,
		domReference: this.#referenceElement as Element | null,
	}));

	constructor(private readonly options: UseFloatingRootContextOptions) {
		this.#nested = useFloatingParentNodeId() != null;

		this.#referenceElement = this.options.elements.reference;
		this.#floatingElement = this.options.elements.floating;

		$effect.pre(() => {
			this.#referenceElement = this.options.elements.reference;
		});

		$effect.pre(() => {
			this.#floatingElement = this.options.elements.floating;
		});

		if (DEV) {
			if (
				options.elements.reference &&
				!isElement(options.elements.reference)
			) {
				error(
					"Cannot pass a virtual element to the `elements.reference` option,",
					"as it must be a real DOM element. Use `floating.setPositionReference()`",
					"instead.",
				);
			}
		}
		this.#positionReference = options.elements.reference;
	}

	onOpenChange: OnOpenChange = (open, event, reason) => {
		this.data.openEvent = open ? event : undefined;
		this.events.emit("openchange", {
			open,
			event,
			reason,
			nested: this.#nested,
		});
		this.options.onOpenChange?.(open, event, reason);
	};

	setPositionReference = (node: ReferenceElement | null) => {
		this.#positionReference = node;
	};

	get elements() {
		const _this = this;
		return {
			get reference() {
				return _this.#elements.reference;
			},
			get floating() {
				return _this.#elements.floating;
			},
			set floating(node: HTMLElement | null) {
				_this.#floatingElement = node;
			},
			get domReference() {
				return _this.#referenceElement;
			},
		};
	}
}

export function useFloatingRootContext(options: UseFloatingRootContextOptions) {
	return new FloatingRootContext(options);
}

export type { UseFloatingRootContextOptions };
export { FloatingRootContext };
