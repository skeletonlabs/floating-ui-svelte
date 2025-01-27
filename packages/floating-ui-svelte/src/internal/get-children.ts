import type { FloatingNodeType, ReferenceType } from "../types.js";

function getChildren<RT extends ReferenceType = ReferenceType>(
	nodes: Array<FloatingNodeType<RT>>,
	id: string | undefined,
) {
	let allChildren = nodes.filter(
		(node) => node.parentId === id && node.context?.open,
	);
	let currentChildren = allChildren;

	while (currentChildren.length) {
		currentChildren = nodes.filter((node) =>
			currentChildren?.some(
				(n) => node.parentId === n.id && node.context?.open,
			),
		);

		allChildren = allChildren.concat(currentChildren);
	}

	return allChildren;
}

function getRawChildren<RT extends ReferenceType = ReferenceType>(
	nodes: Array<{
		id: string | undefined;
		parentId: string | null;
		open: boolean;
		__outsidePressBubbles: boolean;
	}>,
	id: string | undefined,
) {
	console.log("nodes in getRaw", nodes);
	console.log("id", id);
	let allChildren = nodes.filter((node) => node.parentId === id && node.open);
	console.log("all children", allChildren);
	let currentChildren = allChildren;

	while (currentChildren.length) {
		currentChildren = nodes.filter((node) =>
			currentChildren?.some((n) => node.parentId === n.id && node.open),
		);

		allChildren = allChildren.concat(currentChildren);
	}

	return allChildren;
}

function getDeepestNode<RT extends ReferenceType = ReferenceType>(
	nodes: Array<FloatingNodeType<RT>>,
	id: string | undefined,
) {
	let deepestNodeId: string | undefined;
	let maxDepth = -1;

	function findDeepest(nodeId: string | undefined, depth: number) {
		if (depth > maxDepth) {
			deepestNodeId = nodeId;
			maxDepth = depth;
		}

		const children = getChildren(nodes, nodeId);

		for (const child of children) {
			findDeepest(child.id, depth + 1);
		}
	}

	findDeepest(id, 0);

	return nodes.find((node) => node.id === deepestNodeId);
}

export { getChildren, getDeepestNode, getRawChildren };
