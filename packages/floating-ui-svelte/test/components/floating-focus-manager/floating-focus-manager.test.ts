import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Main from "./main.svelte";
import { tick } from "svelte";
import NestedNested from "./nested-nested.svelte";

async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("FloatingFocusManager", () => {
	describe("initialFocus", () => {
		it("handles numbers", async () => {
			render(Main);

			await fireEvent.click(screen.getByTestId("reference"));
			await sleep(20);

			expect(screen.getByTestId("one")).toHaveFocus();
			const incrementButton = screen.getByTestId("increment-initialFocus");

			await fireEvent.click(incrementButton);
			expect(screen.getByTestId("two")).not.toHaveFocus();

			await fireEvent.click(incrementButton);
			expect(screen.getByTestId("three")).not.toHaveFocus();
		});

		it("handles elements", async () => {
			render(Main, { initialFocus: "two" });
			await fireEvent.click(screen.getByTestId("reference"));
			await sleep(20);

			expect(screen.getByTestId("two")).toHaveFocus();
		});

		it("respects autofocus", async () => {
			render(Main, { renderInput: true });

			await fireEvent.click(screen.getByTestId("reference"));
			expect(screen.getByTestId("input")).toHaveFocus();
		});
	});

	describe("returnFocus", () => {
		it("respects true", async () => {
			render(Main);

			screen.getByTestId("reference").focus();
			await fireEvent.click(screen.getByTestId("reference"));
			await sleep(20);

			expect(screen.getByTestId("one")).toHaveFocus();

			await fireEvent.click(screen.getByTestId("three"));
			expect(screen.getByTestId("reference")).toHaveFocus();
		});

		it("respects false", async () => {
			render(Main, { returnFocus: false });

			screen.getByTestId("reference").focus();
			await fireEvent.click(screen.getByTestId("reference"));
			await sleep(20);

			expect(screen.getByTestId("one")).toHaveFocus();

			await fireEvent.click(screen.getByTestId("three"));
			expect(screen.getByTestId("reference")).not.toHaveFocus();
		});

		it("respects ref", async () => {
			render(Main, { returnFocus: "inputRef" });
			screen.getByTestId("reference").focus();
			await fireEvent.click(screen.getByTestId("reference"));
			await sleep(20);

			expect(screen.getByTestId("one")).toHaveFocus();

			await fireEvent.click(screen.getByTestId("three"));
			expect(screen.getByTestId("reference")).not.toHaveFocus();
			expect(screen.getByTestId("focus-target")).toHaveFocus();
		});

		it("always returns to the reference for nested elements", async () => {
			render(NestedNested);
			await fireEvent.click(screen.getByTestId("open-dialog"));
			await fireEvent.click(screen.getByTestId("open-nested-dialog"));

			expect(screen.queryByTestId("close-nested-dialog")).toBeInTheDocument();

			await fireEvent.pointerDown(document.body);

			expect(
				screen.queryByTestId("close-nested-dialog"),
			).not.toBeInTheDocument();

			await fireEvent.pointerDown(document.body);

			expect(screen.queryByTestId("close-dialog")).not.toBeInTheDocument();
		});
	});
});
