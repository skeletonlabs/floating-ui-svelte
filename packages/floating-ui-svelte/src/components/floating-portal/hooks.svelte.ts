import { useId } from "../../hooks/use-id.js";
import { ORIGIN_ID_ATTRIBUTE } from "../../internal/attributes.js";
import { Context } from "../../internal/context.js";
import { createAttribute } from "../../internal/dom.js";
import { extract } from "../../internal/extract.js";
import { watch } from "../../internal/watch.svelte.js";
import type { MaybeGetter, OnOpenChange } from "../../types.js";

type FocusManagerState = {
	modal: boolean;
	open: boolean;
	onOpenChange: OnOpenChange;
	domReference: Element | null;
	closeOnFocusOut: boolean;
} | null;

const PortalContext = new Context<{
	preserveTabOrder: boolean;
	portalNode: HTMLElement | null;
	setFocusManagerState: (state: FocusManagerState) => void;
	beforeInsideGuard: HTMLSpanElement | null;
	afterInsideGuard: HTMLSpanElement | null;
	beforeOutsideGuard: HTMLSpanElement | null;
	afterOutsideGuard: HTMLSpanElement | null;
} | null>("PortalContext");

const attr = createAttribute("portal");

function usePortalContext() {
	return PortalContext.getOr(null);
}

interface UseFloatingPortalNodeProps {
	id?: MaybeGetter<string | undefined>;
	root?: MaybeGetter<HTMLElement | null | undefined>;
	originFloatingId?: MaybeGetter<string | null | undefined>;
}

function useFloatingPortalNode(props: UseFloatingPortalNodeProps = {}) {
	const id = $derived(extract(props.id));
	const root = $derived(extract(props.root));
	const originFloatingId = $derived(extract(props.originFloatingId));

	const uniqueId = useId();
	const portalContext = usePortalContext();

	let portalNode = $state<HTMLElement | null>(null);

	watch(
		() => originFloatingId,
		() => {
			if (originFloatingId && portalNode) {
				portalNode.setAttribute(ORIGIN_ID_ATTRIBUTE, originFloatingId);
			}
		},
	);

	$effect.pre(() => {
		return () => {
			portalNode?.remove();
			// Allow the subsequent layout effects to create a new node on updates.
			// The portal node will still be cleaned up on unmount.
			// https://github.com/floating-ui/floating-ui/issues/2454
			queueMicrotask(() => {
				portalNode = null;
			});
		};
	});

	watch.pre(
		() => id,
		(id) => {
			if (portalNode) return;
			const existingIdRoot = id ? document.getElementById(id) : null;
			if (!existingIdRoot) return;

			const subRoot = document.createElement("div");
			subRoot.id = uniqueId;
			subRoot.setAttribute(attr, "");
			existingIdRoot.appendChild(subRoot);
			portalNode = subRoot;
		},
	);

	watch.pre(
		[() => id, () => root, () => portalContext?.portalNode],
		([id, root, portalContextNode]) => {
			// Wait for the root to exist before creating the portal node.
			if (root === null) return;
			if (portalNode) return;

			let container = root || portalContextNode;
			container = container || document.body;

			let idWrapper: HTMLDivElement | null = null;
			if (id) {
				idWrapper = document.createElement("div");
				idWrapper.id = id;
				container.appendChild(idWrapper);
			}

			const subRoot = document.createElement("div");

			subRoot.id = uniqueId;
			subRoot.setAttribute(attr, "");

			container = idWrapper || container;
			container.appendChild(subRoot);
			portalNode = subRoot;
		},
	);

	return {
		get current() {
			return portalNode;
		},
	};
}

export { usePortalContext, useFloatingPortalNode, PortalContext };
export type { UseFloatingPortalNodeProps, FocusManagerState };
