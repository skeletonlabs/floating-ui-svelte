import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Main from "./wrapper-components/use-list-navigation/main.svelte";
import Autocomplete from "./wrapper-components/use-list-navigation/autocomplete.svelte";
import { userEvent } from "@testing-library/user-event";
import { testKbd } from "../../utils.js";

it("opens on ArrowDown and focuses first item", async () => {
	render(Main);

	await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowDown" });

	await waitFor(() => expect(screen.getByRole("menu")).toBeInTheDocument());
	await waitFor(() => expect(screen.getByTestId("item-0")).toHaveFocus());
});

it("opens on ArrowUp and focuses last item", async () => {
	render(Main);

	await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowUp" });

	await waitFor(() => expect(screen.getByRole("menu")).toBeInTheDocument());
	await waitFor(() => expect(screen.getByTestId("item-2")).toHaveFocus());
});

it("navigates down on ArrowDown", async () => {
	render(Main);

	await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowDown" });
	await waitFor(() => expect(screen.queryByRole("menu")).toBeInTheDocument());
	await waitFor(() => expect(screen.getByTestId("item-0")).toHaveFocus());

	await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
	await waitFor(() => expect(screen.getByTestId("item-1")).toHaveFocus());

	await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
	await waitFor(() => expect(screen.getByTestId("item-2")).toHaveFocus());

	// Reached the end of the list.
	await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
	await waitFor(() => expect(screen.getByTestId("item-2")).toHaveFocus());
});

it("navigates up on ArrowUp", async () => {
	render(Main);
	await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowUp" });
	await waitFor(() => expect(screen.queryByRole("menu")).toBeInTheDocument());
	await waitFor(() => expect(screen.getByTestId("item-2")).toHaveFocus());

	await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowUp" });
	await waitFor(() => expect(screen.getByTestId("item-1")).toHaveFocus());

	await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowUp" });
	await waitFor(() => expect(screen.getByTestId("item-0")).toHaveFocus());

	// Reached the end of the list.
	await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowUp" });
	await waitFor(() => expect(screen.getByTestId("item-0")).toHaveFocus());
});

it("resets index to -1 upon close", async () => {
	render(Autocomplete);
	screen.getByTestId("reference").focus();

	await userEvent.keyboard("a");

	expect(screen.getByTestId("floating")).toBeInTheDocument();
	expect(screen.getByTestId("active-index").textContent).toBe("");

	await userEvent.keyboard(testKbd.ARROW_DOWN);
	await userEvent.keyboard(testKbd.ARROW_DOWN);
	await userEvent.keyboard(testKbd.ARROW_DOWN);

	expect(screen.getByTestId("active-index").textContent).toBe("2");

	await userEvent.keyboard(testKbd.ESCAPE);

	expect(screen.getByTestId("active-index").textContent).toBe("");

	await userEvent.keyboard(testKbd.BACKSPACE);
	await userEvent.keyboard("a");

	expect(screen.getByTestId("floating")).toBeInTheDocument();
	expect(screen.getByTestId("active-index").textContent).toBe("");

	await userEvent.keyboard(testKbd.ARROW_DOWN);

	expect(screen.getByTestId("active-index").textContent).toBe("0");
});

describe("loop", () => {
	it("handles ArrowDown looping", async () => {
		render(Main, { loop: true });

		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowDown" });
		await waitFor(() => expect(screen.queryByRole("menu")).toBeInTheDocument());
		await waitFor(() => expect(screen.getByTestId("item-0")).toHaveFocus());

		await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
		await waitFor(() => expect(screen.getByTestId("item-1")).toHaveFocus());

		await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
		await waitFor(() => expect(screen.getByTestId("item-2")).toHaveFocus());

		// Reached the end of the list and loops.
		await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
		await waitFor(() => expect(screen.getByTestId("item-0")).toHaveFocus());
	});

	it("handles ArrowDown looping", async () => {
		render(Main, { loop: true });

		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowUp" });
		await waitFor(() => expect(screen.queryByRole("menu")).toBeInTheDocument());
		await waitFor(() => expect(screen.getByTestId("item-2")).toHaveFocus());

		await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowUp" });
		await waitFor(() => expect(screen.getByTestId("item-1")).toHaveFocus());

		await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowUp" });
		await waitFor(() => expect(screen.getByTestId("item-0")).toHaveFocus());

		// Reached the end of the list and loops.
		await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowUp" });
		await waitFor(() => expect(screen.getByTestId("item-2")).toHaveFocus());
	});
});

describe("orientation", () => {
	it("navigates down on ArrowRight", async () => {
		render(Main, { orientation: "horizontal" });
		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowRight" });
		await waitFor(() => expect(screen.queryByRole("menu")).toBeInTheDocument());
		await waitFor(() => expect(screen.getByTestId("item-0")).toHaveFocus());

		await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowRight" });
		await waitFor(() => expect(screen.getByTestId("item-1")).toHaveFocus());

		await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowRight" });
		await waitFor(() => expect(screen.getByTestId("item-2")).toHaveFocus());

		// Reached the end of the list.
		await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowRight" });
		await waitFor(() => expect(screen.getByTestId("item-2")).toHaveFocus());
	});

	it("navigates up on ArrowLeft", async () => {
		render(Main, { orientation: "horizontal" });

		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowLeft" });
		await waitFor(() => expect(screen.queryByRole("menu")).toBeInTheDocument());
		await waitFor(() => expect(screen.getByTestId("item-2")).toHaveFocus());

		await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowLeft" });
		await waitFor(() => expect(screen.getByTestId("item-1")).toHaveFocus());

		await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowLeft" });
		await waitFor(() => expect(screen.getByTestId("item-0")).toHaveFocus());

		// Reached the end of the list.
		await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowLeft" });
		await waitFor(() => expect(screen.getByTestId("item-0")).toHaveFocus());
	});
});

describe("rtl", () => {
	it("navigates down on ArrowLeft", async () => {
		render(Main, { rtl: true, orientation: "horizontal" });

		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowLeft" });
		await waitFor(() => expect(screen.queryByRole("menu")).toBeInTheDocument());
		await waitFor(() => expect(screen.getByTestId("item-0")).toHaveFocus());

		await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowLeft" });
		await waitFor(() => expect(screen.getByTestId("item-1")).toHaveFocus());

		await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowLeft" });
		await waitFor(() => expect(screen.getByTestId("item-2")).toHaveFocus());

		// Reached the end of the list.
		await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowLeft" });
		await waitFor(() => expect(screen.getByTestId("item-2")).toHaveFocus());
	});

	it("navigates up on ArrowRight", async () => {
		render(Main, { rtl: true, orientation: "horizontal" });
		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowRight" });
		await waitFor(() => expect(screen.queryByRole("menu")).toBeInTheDocument());
		await waitFor(() => expect(screen.getByTestId("item-2")).toHaveFocus());

		await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowRight" });
		await waitFor(() => expect(screen.getByTestId("item-1")).toHaveFocus());

		await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowRight" });
		await waitFor(() => expect(screen.getByTestId("item-0")).toHaveFocus());

		// Reached the end of the list.
		await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowRight" });
		await waitFor(() => expect(screen.getByTestId("item-0")).toHaveFocus());
	});
});

describe("focusItemOnOpen", () => {
	it("respects true", async () => {
		render(Main, { focusItemOnOpen: true });

		await fireEvent.click(screen.getByRole("button"));
		await waitFor(() => expect(screen.getByTestId("item-0")).toHaveFocus());
	});

	it("respects false", async () => {
		render(Main, { focusItemOnOpen: false });

		await fireEvent.click(screen.getByRole("button"));
		await waitFor(() => expect(screen.getByTestId("item-0")).not.toHaveFocus());
	});
});

describe("allowEscape + virtual", () => {
	it("respects true", async () => {
		render(Main, { allowEscape: true, virtual: true, loop: true });
		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowDown" });
		await waitFor(() =>
			expect(screen.getByTestId("item-0").getAttribute("aria-selected")).toBe(
				"true",
			),
		);
		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowUp" });
		await waitFor(() =>
			expect(screen.getByTestId("item-0").getAttribute("aria-selected")).toBe(
				"false",
			),
		);
		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowDown" });
		await waitFor(() =>
			expect(screen.getByTestId("item-0").getAttribute("aria-selected")).toBe(
				"true",
			),
		);
		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowDown" });
		await waitFor(() =>
			expect(screen.getByTestId("item-1").getAttribute("aria-selected")).toBe(
				"true",
			),
		);
		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowDown" });
		await waitFor(() =>
			expect(screen.getByTestId("item-2").getAttribute("aria-selected")).toBe(
				"true",
			),
		);
		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowDown" });
		await waitFor(() =>
			expect(screen.getByTestId("item-2").getAttribute("aria-selected")).toBe(
				"false",
			),
		);
	});

	it("respects false", async () => {
		render(Main, { allowEscape: false, virtual: true, loop: true });
		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowDown" });
		await waitFor(() =>
			expect(screen.getByTestId("item-0").getAttribute("aria-selected")).toBe(
				"true",
			),
		);
		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowDown" });
		await waitFor(() =>
			expect(screen.getByTestId("item-1").getAttribute("aria-selected")).toBe(
				"true",
			),
		);
	});

	it("true - calls `onNavigate` with `null` when escaped", async () => {
		const spy = vi.fn();
		render(Main, {
			allowEscape: true,
			virtual: true,
			loop: true,
			onNavigate: spy,
		});
		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowDown" });
		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowUp" });
		await waitFor(() => expect(spy).toHaveBeenCalledTimes(2));
		await waitFor(() => expect(spy).toHaveBeenCalledWith(null));
	});
});

describe("openOnArrowKeyDown", () => {
	it("true ArrowDown opens", async () => {
		render(Main, { openOnArrowKeyDown: true });
		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowDown" });
		await waitFor(() => expect(screen.getByRole("menu")).toBeInTheDocument());
	});

	it("true ArrowUp opens", async () => {
		render(Main, { openOnArrowKeyDown: true });
		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowUp" });
		await waitFor(() => expect(screen.getByRole("menu")).toBeInTheDocument());
	});

	it("false ArrowDown does not open", async () => {
		render(Main, { openOnArrowKeyDown: false });
		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowDown" });
		await waitFor(() =>
			expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
		);
	});

	it("false ArrowUp does not open", async () => {
		render(Main, { openOnArrowKeyDown: false });
		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowUp" });
		await waitFor(() =>
			expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
		);
	});
});

describe("disabledIndices", () => {
	it("skips disabled indices", async () => {
		render(Main, { disabledIndices: [0] });

		await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowDown" });
		await waitFor(() => expect(screen.getByTestId("item-1")).toHaveFocus());
		await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowUp" });
		await waitFor(() => expect(screen.getByTestId("item-1")).toHaveFocus());
	});
});

describe.skip("focusOnHover");

describe.skip("grid navigation");

describe.skip("grid navigation when items have different sizes");
