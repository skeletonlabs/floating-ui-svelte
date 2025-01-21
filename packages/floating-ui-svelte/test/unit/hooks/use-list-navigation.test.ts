import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Main from "./wrapper-components/use-list-navigation/main.svelte";
import Autocomplete from "./wrapper-components/use-list-navigation/autocomplete.svelte";
import { userEvent } from "@testing-library/user-event";
import { sleep, testKbd } from "../../utils.js";
import Grid from "../../visual/components/grid/main.svelte";
import ComplexGrid from "../../visual/components/complex-grid/main.svelte";
import Scheduled from "./wrapper-components/use-list-navigation/scheduled.svelte";
import Select from "./wrapper-components/use-list-navigation/select.svelte";

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
	await waitFor(() =>
		expect(screen.getByTestId("active-index").textContent).toBe(""),
	);

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

describe("focusOnHover", () => {
	it("true - focuses item on hover and syncs the active index", async () => {
		const spy = vi.fn();
		render(Main, { onNavigate: spy });

		await fireEvent.click(screen.getByRole("button"));
		await fireEvent.mouseMove(screen.getByTestId("item-1"));
		await waitFor(() => expect(screen.getByTestId("item-1")).toHaveFocus());
		await fireEvent.pointerLeave(screen.getByTestId("item-1"));
		await waitFor(() => expect(screen.getByRole("menu")).toHaveFocus());
		await waitFor(() => expect(spy).toHaveBeenCalledWith(1));
	});

	it("false - does not focus item on hover and does not sync the active index", async () => {
		const spy = vi.fn();
		render(Main, {
			onNavigate: spy,
			focusItemOnOpen: false,
			focusItemOnHover: false,
		});
		await userEvent.click(screen.getByRole("button"));
		await waitFor(() => expect(screen.getByRole("button")).toHaveFocus());
		await fireEvent.mouseMove(screen.getByTestId("item-1"));
		expect(screen.getByTestId("item-1")).not.toHaveFocus();
		expect(spy).toHaveBeenCalledTimes(0);
	});
});

describe("grid navigation", () => {
	it("focuses first item on ArrowDown", async () => {
		render(Grid);
		await fireEvent.click(screen.getByRole("button"));
		await waitFor(() => expect(screen.queryByRole("menu")).toBeInTheDocument());
		await fireEvent.keyDown(document, { key: "ArrowDown" });
		await waitFor(() => expect(screen.getAllByRole("option")[8]).toHaveFocus());
	});

	it("focuses first non-disabled item in grid", async () => {
		render(Grid);
		await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
		await fireEvent.click(screen.getByRole("button"));
		await waitFor(() => expect(screen.getAllByRole("option")[8]).toHaveFocus());
	});

	it("focuses next item using ArrowRight ke, skipping disabled items", async () => {
		render(Grid);
		await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
		await fireEvent.click(screen.getByRole("button"));
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowRight",
		});
		expect(screen.getAllByRole("option")[9]).toHaveFocus();
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowRight",
		});
		expect(screen.getAllByRole("option")[11]).toHaveFocus();
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowRight",
		});
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowRight",
		});
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowRight",
		});
		expect(screen.getAllByRole("option")[14]).toHaveFocus();
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowRight",
		});
		expect(screen.getAllByRole("option")[16]).toHaveFocus();
	});

	it("focuses previous item using ArrowLeft key, skipping disabled items", async () => {
		render(Grid);
		await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
		await fireEvent.click(screen.getByRole("button"));

		await act(() => screen.getAllByRole("option")[47].focus());

		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowLeft",
		});
		expect(screen.getAllByRole("option")[46]).toHaveFocus();
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowLeft",
		});
		await waitFor(() =>
			expect(screen.getAllByRole("option")[44]).toHaveFocus(),
		);
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowLeft",
		});
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowLeft",
		});
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowLeft",
		});
		expect(screen.getAllByRole("option")[41]).toHaveFocus();
	});

	it("skips row and remains on same column when pressing ArrowDown", async () => {
		render(Grid);
		await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
		await fireEvent.click(screen.getByRole("button"));
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowDown",
		});
		expect(screen.getAllByRole("option")[13]).toHaveFocus();
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowDown",
		});
		expect(screen.getAllByRole("option")[18]).toHaveFocus();
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowDown",
		});
		expect(screen.getAllByRole("option")[23]).toHaveFocus();
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowDown",
		});
		expect(screen.getAllByRole("option")[28]).toHaveFocus();
	});

	it("skips row and remains on same column when pressing ArrowUp", async () => {
		render(Grid);
		await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
		await fireEvent.click(screen.getByRole("button"));

		await act(() => screen.getAllByRole("option")[47].focus());

		await fireEvent.keyDown(screen.getByTestId("floating"), { key: "ArrowUp" });
		expect(screen.getAllByRole("option")[42]).toHaveFocus();
		await fireEvent.keyDown(screen.getByTestId("floating"), { key: "ArrowUp" });
		expect(screen.getAllByRole("option")[37]).toHaveFocus();
		await fireEvent.keyDown(screen.getByTestId("floating"), { key: "ArrowUp" });
		expect(screen.getAllByRole("option")[32]).toHaveFocus();
		await fireEvent.keyDown(screen.getByTestId("floating"), { key: "ArrowUp" });
		expect(screen.getAllByRole("option")[27]).toHaveFocus();
	});

	it("loops on the same column with ArrowDown", async () => {
		render(Grid, { loop: true });
		await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
		await fireEvent.click(screen.getByRole("button"));

		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowDown",
		});
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowDown",
		});
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowDown",
		});
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowDown",
		});
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowDown",
		});
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowDown",
		});
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowDown",
		});
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowDown",
		});

		expect(screen.getAllByRole("option")[8]).toHaveFocus();
	});

	it("loops on the same column with ArrowUp", async () => {
		render(Grid, { loop: true });
		await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
		await fireEvent.click(screen.getByRole("button"));

		await act(() => screen.getAllByRole("option")[43].focus());

		await fireEvent.keyDown(screen.getByTestId("floating"), { key: "ArrowUp" });
		await fireEvent.keyDown(screen.getByTestId("floating"), { key: "ArrowUp" });
		await fireEvent.keyDown(screen.getByTestId("floating"), { key: "ArrowUp" });
		await fireEvent.keyDown(screen.getByTestId("floating"), { key: "ArrowUp" });
		await fireEvent.keyDown(screen.getByTestId("floating"), { key: "ArrowUp" });
		await fireEvent.keyDown(screen.getByTestId("floating"), { key: "ArrowUp" });
		await fireEvent.keyDown(screen.getByTestId("floating"), { key: "ArrowUp" });
		await fireEvent.keyDown(screen.getByTestId("floating"), { key: "ArrowUp" });

		expect(screen.getAllByRole("option")[43]).toHaveFocus();
	});

	it("does not leave row with 'both' orientation while looping", async () => {
		render(Grid, { orientation: "both", loop: true });
		await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
		await fireEvent.click(screen.getByRole("button"));

		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowRight",
		});
		expect(screen.getAllByRole("option")[9]).toHaveFocus();
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowRight",
		});
		expect(screen.getAllByRole("option")[8]).toHaveFocus();
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowLeft",
		});
		expect(screen.getAllByRole("option")[9]).toHaveFocus();
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowLeft",
		});
		expect(screen.getAllByRole("option")[8]).toHaveFocus();

		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowDown",
		});
		expect(screen.getAllByRole("option")[13]).toHaveFocus();
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowRight",
		});
		expect(screen.getAllByRole("option")[14]).toHaveFocus();
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowRight",
		});
		expect(screen.getAllByRole("option")[11]).toHaveFocus();
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowLeft",
		});
		expect(screen.getAllByRole("option")[14]).toHaveFocus();
	});

	it("loops on the last row", async () => {
		render(Grid, { orientation: "both", loop: true });
		await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
		await fireEvent.click(screen.getByRole("button"));

		await act(() => screen.getAllByRole("option")[46].focus());

		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowRight",
		});
		expect(screen.getAllByRole("option")[47]).toHaveFocus();
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowRight",
		});
		expect(screen.getAllByRole("option")[46]).toHaveFocus();
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowLeft",
		});
		expect(screen.getAllByRole("option")[47]).toHaveFocus();
		await fireEvent.keyDown(screen.getByTestId("floating"), {
			key: "ArrowLeft",
		});
		expect(screen.getAllByRole("option")[46]).toHaveFocus();
	});
});

describe("grid navigation when items have different sizes", () => {
	it("focuses first non-disabled item in a grid", async () => {
		render(ComplexGrid);
		await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
		await fireEvent.click(screen.getByRole("button"));
		await waitFor(() => expect(screen.getAllByRole("option")[7]).toHaveFocus());
	});

	describe.each([
		{ rtl: false, arrowToStart: "ArrowLeft", arrowToEnd: "ArrowRight" },
		{ rtl: true, arrowToStart: "ArrowRight", arrowToEnd: "ArrowLeft" },
	])("with rtl $rtl", ({ rtl, arrowToStart, arrowToEnd }) => {
		it(`focuses next item using ${arrowToEnd} key, skipping disabled items`, async () => {
			render(ComplexGrid, { rtl });
			await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
			await fireEvent.click(screen.getByRole("button"));
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[8]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[10]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[13]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[15]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[20]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[24]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[34]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[36]).toHaveFocus(),
			);
		});

		it(`focuses previous item using ${arrowToStart} key, skipping disabled items`, async () => {
			render(ComplexGrid, { rtl });

			await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
			await fireEvent.click(screen.getByRole("button"));

			await act(() => screen.getAllByRole("option")[36].focus());

			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[34]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[28]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[20]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[7]).toHaveFocus(),
			);
		});

		it(`moves through rows when pressing ArrowDown, prefers ${rtl ? "right" : "left"} side of wide items`, async () => {
			render(ComplexGrid, { rtl });
			await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
			await fireEvent.click(screen.getByRole("button"));
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowDown",
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[20]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowDown",
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[25]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowDown",
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[31]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowDown",
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[36]).toHaveFocus(),
			);
		});

		it(`moves through rows when pressing ArrowUp, prefers ${rtl ? "right" : "left"} side of wide items`, async () => {
			render(ComplexGrid, { rtl });

			await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
			await fireEvent.click(screen.getByRole("button"));

			await act(() => screen.getAllByRole("option")[29].focus());

			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowUp",
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[21]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowUp",
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[15]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowUp",
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[8]).toHaveFocus(),
			);
		});

		it(`loops over column with ArrowDown, prefers ${rtl ? "right" : "left"} side of wide items`, async () => {
			render(ComplexGrid, { rtl, loop: true });
			await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
			await fireEvent.click(screen.getByRole("button"));

			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowDown",
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowDown",
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowDown",
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowDown",
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowDown",
			});

			await waitFor(() =>
				expect(screen.getAllByRole("option")[13]).toHaveFocus(),
			);
		});

		it(`loops over column with ArrowUp, prefers ${rtl ? "right" : "left"} side of wide items`, async () => {
			render(ComplexGrid, { rtl, loop: true });
			await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
			await fireEvent.click(screen.getByRole("button"));

			await act(() => screen.getAllByRole("option")[30].focus());

			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowUp",
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowUp",
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowUp",
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowUp",
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowUp",
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowUp",
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowUp",
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowUp",
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowUp",
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowUp",
			});

			await waitFor(() =>
				expect(screen.getAllByRole("option")[8]).toHaveFocus(),
			);
		});

		it("loops over row with 'both' orientation, prefers top side of tall items", async () => {
			render(ComplexGrid, { rtl, orientation: "both", loop: true });
			await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
			await fireEvent.click(screen.getByRole("button"));

			await act(() => screen.getAllByRole("option")[20].focus());

			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[21]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[20]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[21]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToStart,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[21]).toHaveFocus(),
			);

			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: "ArrowDown",
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[22]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[24]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[20]).toHaveFocus(),
			);
			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[21]).toHaveFocus(),
			);
		});

		it("handles looping on the last row", async () => {
			render(ComplexGrid, { rtl, orientation: "both", loop: true });
			await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
			await fireEvent.click(screen.getByRole("button"));

			await act(() => screen.getAllByRole("option")[36].focus());

			await fireEvent.keyDown(screen.getByTestId("floating"), {
				key: arrowToEnd,
			});
			await waitFor(() =>
				expect(screen.getAllByRole("option")[36]).toHaveFocus(),
			);
		});
	});
});

it("handles scheduled list population", async () => {
	render(Scheduled);

	await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowUp" });

	await act(async () => {});

	await waitFor(() => expect(screen.getAllByRole("option")[2]).toHaveFocus());

	await fireEvent.click(screen.getByRole("button"));
	await fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowDown" });

	await act(async () => {});

	await waitFor(() => expect(screen.getAllByRole("option")[0]).toHaveFocus());
});

it("async selectedIndex", async () => {
	render(Select);

	await userEvent.click(screen.getByRole("button"));
	await act(async () => {});

	await waitFor(() => expect(screen.getAllByRole("option")[2]).toHaveFocus());
	await userEvent.keyboard(testKbd.ARROW_DOWN);
	await waitFor(() => expect(screen.getAllByRole("option")[3]).toHaveFocus());
});

it.todo("grid navigation with changing list items");

it.todo("grid navigation with disabled list items");

it.todo("selectedIndex changing does not steal focus");

it.todo("focus management in nested lists");

it.todo("virtual nested home or end key presses");

it.todo("domReference trigger in nested virtual menu is set as virtual item");

it.todo("Home or End key press is ignored for typeable combobox reference");
