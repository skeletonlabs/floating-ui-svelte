import { describe, expect, it, vi } from "vitest";
import { useFloating } from "../../src/index.js";
import { withRunes } from "../internal/with-runes.svelte.js";
import {
	useMergeRefs,
	type BoxedRef,
} from "../../src/hooks/use-merge-refs.svelte.js";

describe("useMergeRefs", () => {
	vi.mock(import("svelte"), async (importOriginal) => {
		const actual = await importOriginal();
		return {
			...actual,
			getContext: vi.fn().mockReturnValue(null),
		};
	});

	it(
		"merges the references of multiple floating instances or other boxed elements",
		withRunes(() => {
			const ref1 = useFloating();
			const ref2 = useFloating();
			const ref3: BoxedRef = $state({ current: null });

			const mergedRef = useMergeRefs([ref1, ref2, ref3]);
			expect(mergedRef.current).toBe(null);
			expect(ref1.reference).toBe(null);
			expect(ref2.reference).toBe(null);
			expect(ref3.current).toBe(null);

			const node = document.createElement("div");
			mergedRef.current = node;
			expect(mergedRef.current).toBe(node);
			expect(ref1.reference).toBe(node);
			expect(ref2.reference).toBe(node);
			expect(ref3.current).toBe(node);
			mergedRef.current = null;
			expect(mergedRef.current).toBe(null);
			expect(ref1.reference).toBe(null);
			expect(ref2.reference).toBe(null);
			expect(ref3.current).toBe(null);
		}),
	);
});
