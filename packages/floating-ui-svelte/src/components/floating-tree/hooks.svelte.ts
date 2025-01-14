import { untrack } from "svelte";
import { useId } from "../../hooks/use-id.js";
import { Context } from "../../internal/context.js";
import type {
	FloatingNodeType,
	FloatingTreeType,
	ReferenceType,
} from "../../types.js";

const FloatingNodeContext = new Context<FloatingNodeType>(
	"FloatingNodeContext",
);

const FloatingTreeContext = new Context<FloatingTreeType>(
	"FloatingTreeContext",
);

/**
 * Returns the parent node id for nested floating elements, if available.
 * Returns `null` for top-level floating elements.
 */
function useFloatingParentNodeId(): string | null {
	return FloatingNodeContext.getOr(null)?.id || null;
}

/**
 * Returns the nearest floating tree context, if available.
 */
function useFloatingTree<
	RT extends ReferenceType = ReferenceType,
>(): FloatingTreeType<RT> | null {
	return FloatingTreeContext.getOr(null) as FloatingTreeType<RT> | null;
}

/**
 * Registers a node into the `FloatingTree`, returning its id.
 * @see https://floating-ui-svelte.vercel.app/docs/api/use-floating-node-id
 */
function useFloatingNodeId(customParentId?: string): string | undefined {
	const id = useId();
	const tree = useFloatingTree();
	const _parentId = useFloatingParentNodeId();
	const parentId = customParentId || _parentId;

	$effect(() => {
		const node = { id, parentId };
		untrack(() => {
			tree?.addNode(node);
		});
		return () => {
			tree?.removeNode(node);
		};
	});

	return id;
}

export {
	useFloatingNodeId,
	useFloatingParentNodeId,
	useFloatingTree,
	FloatingNodeContext,
	FloatingTreeContext,
};
