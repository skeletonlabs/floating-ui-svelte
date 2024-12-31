import { describe, expect, expectTypeOf, test } from "vitest";
import { useId } from "../../src/hooks/use-id.js";

describe("useId", () => {
	test("returns an id", () => {
		const id = useId();
		expect(id).toBeDefined();
	});

	test("id is of type string", () => {
		const id = useId();
		expectTypeOf(id).toEqualTypeOf<string>();
	});

	test("id is unique", () => {
		for (const _ of Array.from({ length: 1000 })) {
			const id1 = useId();
			const id2 = useId();
			expect(id1).not.toEqual(id2);
		}
	});
});
