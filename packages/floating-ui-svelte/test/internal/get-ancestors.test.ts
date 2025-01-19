import { expect, it } from "vitest";
import { getAncestors } from "../../src/internal/get-ancestors.js";

it("returns an array of ancestors", () => {
	expect(
		getAncestors(
			[
				{ id: "0", parentId: null },
				{ id: "1", parentId: "0" },
				{ id: "2", parentId: "1" },
			],
			"2",
		),
	).toEqual([
		{ id: "1", parentId: "0" },
		{ id: "0", parentId: null },
	]);
});
