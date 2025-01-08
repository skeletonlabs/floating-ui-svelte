import type { ReferenceElement } from "@floating-ui/dom";
import type {
	ContextData,
	FloatingElements,
	FloatingEvents,
	OpenChangeReason,
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

interface FloatingRootContext {
	data: ContextData;
	open: boolean;
	onOpenChange: (
		open: boolean,
		event?: Event,
		reason?: OpenChangeReason,
	) => void;
	elements: FloatingElements;
	events: FloatingEvents;
	floatingId: string | undefined;
	refs: {
		setPositionReference(node: ReferenceElement | null): void;
	};
}

export function useFloatingRootContext(
	options: UseFloatingRootContextOptions,
): FloatingRootContext {
	const {
		open = false,
		onOpenChange: onOpenChangeProp,
		elements: elementsProp,
	} = options;

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

	const positionReference = $state<ReferenceElement | null>(
		elementsProp.reference,
	);
}
