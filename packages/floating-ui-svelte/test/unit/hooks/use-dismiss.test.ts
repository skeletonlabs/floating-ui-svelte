import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import App from "./wrapper-components/use-dismiss.svelte";

describe("useDismiss", () => {
	describe("default", () => {
		it("does dismiss on outside pointerdown", async () => {
			render(App, { open: true });

			expect(screen.queryByTestId("floating")).toBeInTheDocument();

			await fireEvent.pointerDown(document);

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();
		});

		it("does dismiss on `Escape` key press", async () => {
			render(App, { open: true });

			expect(screen.queryByTestId("floating")).toBeInTheDocument();

			await fireEvent.keyDown(document, { key: "Escape" });

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();
		});
	});

	describe("enabled", () => {
		it("does dismiss when set to `true`", async () => {
			render(App, { open: true, enabled: true });

			expect(screen.queryByTestId("floating")).toBeInTheDocument();

			await fireEvent.pointerDown(document);

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();
		});

		it("does not dismiss when set to `false`", async () => {
			render(App, { open: true, enabled: false });

			expect(screen.queryByTestId("floating")).toBeInTheDocument();

			await fireEvent.pointerDown(document);

			expect(screen.queryByTestId("floating")).toBeInTheDocument();
		});
	});

	describe("escapeKey", () => {
		it("does dismiss on `Escape` key press when set to `true`", async () => {
			render(App, { open: true, escapeKey: true });

			expect(screen.queryByTestId("floating")).toBeInTheDocument();

			await fireEvent.keyDown(document, { key: "Escape" });

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();
		});

		it("does not dismiss on `Escape` key press when set to `false`", async () => {
			render(App, { open: true, escapeKey: false });

			expect(screen.queryByTestId("floating")).toBeInTheDocument();

			await fireEvent.keyDown(document, { key: "Escape" });

			expect(screen.queryByTestId("floating")).toBeInTheDocument();
		});
	});

	describe("outsidePress", () => {
		describe("boolean", () => {
			it("does dismiss on outside press when set to `true`", async () => {
				render(App, { open: true, outsidePress: true });

				expect(screen.queryByTestId("floating")).toBeInTheDocument();

				await fireEvent.pointerDown(document);

				expect(screen.queryByTestId("floating")).not.toBeInTheDocument();
			});

			it("does not dismiss on outside press when set to `false`", async () => {
				render(App, { open: true, outsidePress: false });

				expect(screen.queryByTestId("floating")).toBeInTheDocument();

				await fireEvent.pointerDown(document);

				expect(screen.queryByTestId("floating")).toBeInTheDocument();
			});
		});
		describe("function", () => {
			it("does dismiss on outside press when the function returns `true`", async () => {
				const outsidePress = vi.fn(() => true);
				render(App, { open: true, outsidePress });

				expect(outsidePress).not.toHaveBeenCalled();

				expect(screen.queryByTestId("floating")).toBeInTheDocument();

				await fireEvent.pointerDown(document);

				expect(outsidePress).toHaveBeenCalledOnce();

				expect(screen.queryByTestId("floating")).not.toBeInTheDocument();
			});

			it("does not dismiss on outside press when the function returns `false`", async () => {
				const outsidePress = vi.fn(() => false);
				render(App, { open: true, outsidePress: outsidePress });

				expect(outsidePress).not.toHaveBeenCalled();

				expect(screen.queryByTestId("floating")).toBeInTheDocument();

				await fireEvent.pointerDown(document);

				expect(outsidePress).toHaveBeenCalledOnce();

				expect(screen.queryByTestId("floating")).toBeInTheDocument();
			});

			it.skip("passes the corresponding event as argument", async () => {
				const outsidePress = vi.fn(() => true);
				render(App, { open: true, outsidePress });

				expect(outsidePress).not.toHaveBeenCalled();

				const event = new MouseEvent("pointerdown");

				await fireEvent.pointerDown(document, event);

				expect(outsidePress.mock.calls.at(0)?.at(0)).toBe(event);
			});
		});
	});

	describe("outsidePressEvent", () => {
		it("does dismiss on outside `pointerdown` event when set to `pointerdown`", async () => {
			render(App, {
				open: true,
				outsidePress: true,
				outsidePressEvent: "pointerdown",
			});

			expect(screen.queryByTestId("floating")).toBeInTheDocument();

			await fireEvent.pointerDown(document);

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();
		});

		it("does dismiss on outside `mousedown` event when set to `mousedown`", async () => {
			render(App, {
				open: true,
				outsidePress: true,
				outsidePressEvent: "mousedown",
			});

			expect(screen.queryByTestId("floating")).toBeInTheDocument();

			await fireEvent.mouseDown(document);

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();
		});

		it("does dismiss on outside `click` event when set to `click`", async () => {
			render(App, {
				open: true,
				outsidePress: true,
				outsidePressEvent: "click",
			});

			expect(screen.queryByTestId("floating")).toBeInTheDocument();

			await fireEvent.click(document);

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();
		});
	});

	describe("referencePress", () => {
		it("does dismiss on reference press when set to `true`", async () => {
			render(App, { open: true, referencePress: true });

			expect(screen.queryByTestId("floating")).toBeInTheDocument();

			await fireEvent.pointerDown(screen.getByTestId("reference"));

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();
		});

		it("does not dismiss on reference press when set to `false`", async () => {
			render(App, { open: true, referencePress: false });

			expect(screen.queryByTestId("floating")).toBeInTheDocument();

			await fireEvent.pointerDown(screen.getByTestId("reference"));

			expect(screen.queryByTestId("floating")).toBeInTheDocument();
		});
	});

	describe("referencePressEvent", () => {
		it("does dismiss on reference `pointerdown` event when set to `pointerdown`", async () => {
			render(App, {
				open: true,
				referencePress: true,
				referencePressEvent: "pointerdown",
			});

			expect(screen.queryByTestId("floating")).toBeInTheDocument();

			await fireEvent.pointerDown(screen.getByTestId("reference"));

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();
		});

		it("does dismiss on reference `mousedown` event when set to `mousedown`", async () => {
			render(App, {
				open: true,
				referencePress: true,
				referencePressEvent: "mousedown",
			});

			expect(screen.queryByTestId("floating")).toBeInTheDocument();

			await fireEvent.mouseDown(screen.getByTestId("reference"));

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();
		});

		it("does dismiss on reference `click` event when set to `click`", async () => {
			render(App, {
				open: true,
				referencePress: true,
				referencePressEvent: "click",
			});

			expect(screen.queryByTestId("floating")).toBeInTheDocument();

			await fireEvent.click(screen.getByTestId("reference"));

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();
		});
	});

	describe("ancestorScroll", () => {
		it("does dismiss on ancestor scroll when set to `true`", async () => {
			render(App, { open: true, ancestorScroll: true });

			expect(screen.queryByTestId("floating")).toBeInTheDocument();

			await fireEvent.scroll(window);

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();
		});

		it("does not dismiss on ancestor scroll when set to `false`", async () => {
			render(App, { open: true, ancestorScroll: false });

			expect(screen.queryByTestId("floating")).toBeInTheDocument();

			await fireEvent.scroll(window);

			expect(screen.queryByTestId("floating")).toBeInTheDocument();
		});
	});
});
