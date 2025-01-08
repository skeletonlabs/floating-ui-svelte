import type { ReferenceElement } from "@floating-ui/dom";
import type {
	ContextData,
	FloatingEvents,
	OpenChangeReason,
	ReferenceType,
} from "../types.js";
import { useId } from "./use-id.js";
import { createPubSub } from "../internal/create-pub-sub.js";
import { useFloatingParentNodeId } from "../components/floating-tree/hooks.svelte.js";
import { DEV } from "esm-env";
import { isElement } from "@floating-ui/utils/dom";
import { error } from "../internal/log.js";
import { noop } from "../internal/noop.js";

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

interface FloatingRootContext<RT extends ReferenceType = ReferenceType> {
	data: ContextData;
	open: boolean;
	onOpenChange: (
		open: boolean,
		event?: Event,
		reason?: OpenChangeReason,
	) => void;
	elements: {
		domReference: Element | null;
		reference: RT | null;
		floating: HTMLElement | null;
	};
	events: FloatingEvents;
	floatingId: string | undefined;
	refs: {
		setPositionReference(node: ReferenceType | null): void;
	};
}

/**
 * Creates a floating root context to manage the state of a floating element.
 */
function useFloatingRootContext(
	options: UseFloatingRootContextOptions,
): FloatingRootContext {
	const elementsProp: {
		reference: ReferenceType | null;
		floating: HTMLElement | null;
	} = $state(options.elements);
	const { open = false, onOpenChange: onOpenChangeProp = noop } = options;

	const floatingId = useId();
	const data = $state<ContextData>({});
	const events = createPubSub();
	const nested = useFloatingParentNodeId() != null;

	if (DEV) {
		const optionDomReference = elementsProp.reference;
		if (optionDomReference && !isElement(optionDomReference)) {
			error(
				"Cannot pass a virtual element to the `elements.reference` option,",
				"as it must be a real DOM element. Use `refs.setPositionReference()`",
				"instead.",
			);
		}
	}

	// Enable the user to set the position reference later to something other than
	// what it was initialized with
	let positionReference = $state<ReferenceElement | null>(
		elementsProp.reference,
	);

	const onOpenChange = (
		open: boolean,
		event?: Event,
		reason?: OpenChangeReason,
	) => {
		data.openEvent = open ? event : undefined;
		events.emit("openchange", { open, event, reason, nested });
		onOpenChangeProp(open, event, reason);
	};

	const _elements = $derived({
		reference: positionReference || elementsProp.reference || null,
		floating: elementsProp.floating || null,
		domReference: elementsProp.reference as Element | null,
	});

	return {
		data,
		open,
		onOpenChange,
		elements: {
			get reference() {
				return _elements.reference;
			},
			set reference(v: ReferenceType | null) {
				elementsProp.reference = v;
			},
			get floating() {
				return _elements.floating;
			},
			set floating(v: HTMLElement | null) {
				elementsProp.floating = v;
			},
			get domReference() {
				return _elements.domReference;
			},
		},
		events,
		floatingId,
		refs: {
			setPositionReference(node: ReferenceElement | null) {
				positionReference = node;
			},
		},
	};
}

export { useFloatingRootContext };
export type { FloatingRootContext, UseFloatingRootContextOptions };
