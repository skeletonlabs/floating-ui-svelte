import { expect, it } from "vitest";
import type { FloatingContext } from "../../src/index.js";
import { getChildren } from "../../src/internal/get-children.js";

const contextOpen = { open: true } as FloatingContext;
const contextClosed = { open: false } as FloatingContext;

it("returns an array of children, ignoring closed ones", () => {
	expect(
		getChildren(
			[
				{ id: "0", parentId: null, context: contextOpen },
				{ id: "1", parentId: "0", context: contextOpen },
				{ id: "2", parentId: "1", context: contextOpen },
				{ id: "3", parentId: "1", context: contextOpen },
				{ id: "4", parentId: "1", context: contextClosed },
			],
			"0",
		),
	).toEqual([
		{ id: "1", parentId: "0", context: contextOpen },
		{ id: "2", parentId: "1", context: contextOpen },
		{ id: "3", parentId: "1", context: contextOpen },
	]);
});
