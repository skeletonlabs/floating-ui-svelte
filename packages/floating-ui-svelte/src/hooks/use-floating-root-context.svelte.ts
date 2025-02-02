import type { ReferenceElement } from "@floating-ui/dom";
import type {
	ContextData,
	MaybeGetter,
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
import { box } from "../internal/box.svelte.js";
import { extract } from "../internal/extract.js";
import { noop } from "../internal/noop.js";

interface UseFloatingRootContextOptions {
	open?: MaybeGetter<boolean>;
	onOpenChange?: OnOpenChange;
	reference: MaybeGetter<Element | null>;
	floating: MaybeGetter<HTMLElement | null>;
	onReferenceChange?: (node: Element | null) => void;
	onFloatingChange?: (node: HTMLElement | null) => void;
	/**
	 * The id to assign to the floating element.
	 *
	 * @default useId()
	 */
	floatingId?: MaybeGetter<string | undefined | null>;
}

interface FloatingRootContextOptions
	extends ReturnType<typeof useFloatingRootContextOptions> {}

function useFloatingRootContextOptions(opts: UseFloatingRootContextOptions) {
	const open = box.with(() => extract(opts.open, false));
	const floatingId = $derived(extract(opts.floatingId, useId()) ?? useId());
	let _stableReference = $state<Element | null>(null);
	let _stableFloating = $state<HTMLElement | null>(null);
	const reference = box.with(
		() => _stableReference,
		(node) => {
			_stableReference = node;
			opts.onReferenceChange?.(node as Element | null);
		},
	);
	const floating = box.with(
		() => _stableFloating,
		(node) => {
			_stableFloating = node;
			opts.onFloatingChange?.(node);
		},
	);

	reference.current = extract(opts.reference, null);
	floating.current = extract(opts.floating, null);

	$effect.pre(() => {
		reference.current = extract(opts.reference, null);
	});

	$effect.pre(() => {
		floating.current = extract(opts.floating, null);
	});

	return {
		open,
		onOpenChange: opts.onOpenChange ?? noop,
		onReferenceChange: opts.onReferenceChange ?? noop,
		onFloatingChange: opts.onFloatingChange ?? noop,
		reference,
		floating,
		get floatingId() {
			return floatingId;
		},
	};
}

export interface FloatingRootContext<RT extends ReferenceType = ReferenceType>
	extends ReturnType<typeof useFloatingRootContext<RT>> {}

export function useFloatingRootContext<
	RT extends ReferenceType = ReferenceType,
>(_opts: UseFloatingRootContextOptions) {
	const opts = useFloatingRootContextOptions(_opts);

	if (DEV) {
		if (opts.reference.current && !isElement(opts.reference.current)) {
			error(
				"Cannot pass a virtual element to the `elements.reference` option,",
				"as it must be a real DOM element. Use `floating.setPositionReference()`",
				"instead.",
			);
		}
	}
	const data: ContextData<RT> = $state({});
	const events = createPubSub();
	/** Whether the floating element is nested inside another floating element. */
	const nested = useFloatingParentNodeId() != null;
	/** Enables the user to specify a position reference after initialization. */
	let positionReference = $state<ReferenceElement | null>(
		opts.reference.current,
	);
	const reference = $derived(
		(positionReference || opts.reference.current || null) as RT | null,
	);

	function onOpenChange(
		open: boolean,
		event?: Event,
		reason?: OpenChangeReason,
	) {
		data.openEvent = open ? event : undefined;
		events.emit("openchange", {
			open,
			event,
			reason,
			nested,
		});
		opts.onOpenChange?.(open, event, reason);
	}

	function setPositionReference(node: ReferenceElement | null) {
		positionReference = node;
	}

	const elements = $state({
		get reference() {
			return reference;
		},
		get floating() {
			return opts.floating.current;
		},
		get domReference() {
			return opts.reference.current;
		},
	});

	return {
		get floatingId() {
			return opts.floatingId;
		},
		data,
		events,
		get open() {
			return opts.open.current;
		},
		elements,
		onOpenChange,
		setPositionReference,
	};
}
