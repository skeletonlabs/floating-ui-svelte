import { render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { withRunes } from "../../with-runes.svelte.js";
import { useFloating, FloatingArrow } from "../../../src/index.js";

describe.skip("FloatingArrow", () => {
	vi.mock(import("svelte"), async (importOriginal) => {
		const actual = await importOriginal();
		return {
			...actual,
			getContext: vi.fn().mockReturnValue(null),
		};
	});
	it(
		"renders the component to default props",
		withRunes(() => {
			const arrowRef = document.createElement("div");
			const floating = useFloating();
			render(FloatingArrow, {
				props: { ref: arrowRef, context: floating.context },
			});
			const component = screen.getByTestId("floating-arrow");
			expect(component).toBeInTheDocument();
		}),
	);

	it(
		"renders position based on context placement",
		withRunes(() => {
			const arrowRef = document.createElement("div");
			const floating = useFloating({ placement: "left" });
			render(FloatingArrow, {
				props: {
					ref: arrowRef,
					context: floating.context,
					width: 20,
					height: 20,
				},
			});
			const component = screen.getByTestId("floating-arrow");
			expect(component.style.left).toBe("calc(100% - 0px)");
		}),
	);

	it(
		"renders with a custom width and height",
		withRunes(() => {
			const arrowRef = document.createElement("div");
			const floating = useFloating();
			render(FloatingArrow, {
				props: {
					ref: arrowRef,
					context: floating.context,
					width: 20,
					height: 20,
				},
			});
			const component = screen.getByTestId("floating-arrow");
			expect(component.getAttribute("width")).equals("20");
			expect(component.getAttribute("height")).equals("20");
		}),
	);

	it(
		"renders with a custom transform",
		withRunes(() => {
			const arrowRef = document.createElement("div");
			const floating = useFloating();
			render(FloatingArrow, {
				props: { ref: arrowRef, context: floating.context, transform: "123px" },
			});
			const component = screen.getByTestId("floating-arrow");
			expect(component.style.transform).toContain("123px");
		}),
	);

	it(
		"renders with a custom fill",
		withRunes(() => {
			const arrowRef = document.createElement("div");
			const floating = useFloating();
			const testFillColor = "green";
			render(FloatingArrow, {
				props: {
					ref: arrowRef,
					context: floating.context,
					fill: testFillColor,
				},
			});
			const component = screen.getByTestId("floating-arrow");
			expect(component.style.fill).toContain(testFillColor);
		}),
	);
});
