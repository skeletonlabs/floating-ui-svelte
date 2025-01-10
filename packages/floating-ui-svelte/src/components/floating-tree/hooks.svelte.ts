import { useId } from "../../hooks/use-id.js";
import { Context } from "../../internal/context.js";
import type {
	FloatingNodeType,
	FloatingTreeType,
	ReferenceType,
} from "../../types.js";

export const FloatingNodeContext = new Context<FloatingNodeType>(
	"FloatingNodeContext",
);

export const FloatingTreeContext = new Context<FloatingTreeType>(
	"FloatingTreeContext",
);

/**
 * Returns the parent node id for nested floating elements, if available.
 * Returns `null` for top-level floating elements.
 */
export function useFloatingParentNodeId(): string | null {
	return FloatingNodeContext.getOr(null)?.id || null;
}

/**
 * Returns the nearest floating tree context, if available.
 */
export function useFloatingTree<
	RT extends ReferenceType = ReferenceType,
>(): FloatingTreeType<RT> | null {
	return FloatingTreeContext.getOr(null) as FloatingTreeType<RT> | null;
}

/**
 * Registers a node into the `FloatingTree`, returning its id.
 * @see https://floating-ui-svelte.vercel.app/docs/api/use-floating-node-id
 */
export function useFloatingNodeId(customParentId?: string): string | undefined {
	const id = useId();
	const tree = useFloatingTree();
	const _parentId = useFloatingParentNodeId();
	const parentId = customParentId || _parentId;

	$effect(() => {
		const node = { id, parentId };
		tree?.addNode(node);
		return () => {
			tree?.removeNode(node);
		};
	});

	return id;
}
