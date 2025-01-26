import { act, render, screen, waitFor } from "@testing-library/svelte";
import { expect, it, vi } from "vitest";
import Combobox from "./wrapper-components/use-typeahead/typeahead-combobox.svelte";
import Full from "./wrapper-components/use-typeahead/typeahead-full.svelte";
import Select from "./wrapper-components/use-typeahead/typeahead-select.svelte";
import { userEvent } from "@testing-library/user-event";
import { sleep, testKbd } from "../../utils.js";
import Menu from "../../visual/components/menu/main.svelte";

vi.useFakeTimers({ shouldAdvanceTime: true });

it("rapidly focuses list items when they start with the same letter", async () => {
	const spy = vi.fn();
	render(Combobox, { onMatch: spy });

	await userEvent.click(screen.getByRole("combobox"));

	await userEvent.keyboard("t");
	expect(spy).toHaveBeenCalledWith(1);

	await userEvent.keyboard("t");
	expect(spy).toHaveBeenCalledWith(2);

	await userEvent.keyboard("t");
	expect(spy).toHaveBeenCalledWith(1);
});

it("bails out of rapid focus of first letter if the list contains a string that starts with two of the same letter", async () => {
	const spy = vi.fn();
	render(Combobox, { onMatch: spy, list: ["apple", "aaron", "apricot"] });

	await userEvent.click(screen.getByRole("combobox"));

	await userEvent.keyboard("a");
	expect(spy).toHaveBeenCalledWith(0);

	await userEvent.keyboard("a");
	expect(spy).toHaveBeenCalledWith(0);
});

it("starts from the current activeIndex and correctly loops", async () => {
	const spy = vi.fn();
	render(Combobox, {
		onMatch: spy,
		list: ["Toy Story 2", "Toy Story 3", "Toy Story 4"],
	});

	await userEvent.click(screen.getByRole("combobox"));

	await userEvent.keyboard("t");
	await userEvent.keyboard("o");
	await userEvent.keyboard("y");
	expect(spy).toHaveBeenCalledWith(0);

	spy.mockReset();

	await userEvent.keyboard("t");
	await userEvent.keyboard("o");
	await userEvent.keyboard("y");
	expect(spy).not.toHaveBeenCalled();

	vi.advanceTimersByTime(750);

	await userEvent.keyboard("t");
	await userEvent.keyboard("o");
	await userEvent.keyboard("y");
	expect(spy).toHaveBeenCalledWith(1);

	vi.advanceTimersByTime(750);

	await userEvent.keyboard("t");
	await userEvent.keyboard("o");
	await userEvent.keyboard("y");
	expect(spy).toHaveBeenCalledWith(2);

	vi.advanceTimersByTime(750);

	await userEvent.keyboard("t");
	await userEvent.keyboard("o");
	await userEvent.keyboard("y");
	expect(spy).toHaveBeenCalledWith(0);
});

it("should match capslock characters", async () => {
	const spy = vi.fn();
	render(Combobox, { onMatch: spy });

	await userEvent.click(screen.getByRole("combobox"));

	await userEvent.keyboard(`${testKbd.CAPS_LOCK}t`);
	expect(spy).toHaveBeenCalledWith(1);
});

const oneTwoThree = ["one", "two", "three"];

it("matches when focus is within reference", async () => {
	const spy = vi.fn();
	render(Full, { onMatch: spy, list: oneTwoThree });

	await userEvent.click(screen.getByRole("combobox"));

	await userEvent.keyboard("t");
	expect(spy).toHaveBeenCalledWith(1);
});

it("matches when focus is within floating", async () => {
	const spy = vi.fn();
	render(Full, { onMatch: spy, list: oneTwoThree });

	await userEvent.click(screen.getByRole("combobox"));
	await userEvent.keyboard("t");

	const option = await screen.findByRole("option", { selected: true });
	expect(option.textContent).toBe("two");
	option.focus();
	expect(option).toHaveFocus();

	await userEvent.keyboard("h");
	expect(
		(await screen.findByRole("option", { selected: true })).textContent,
	).toBe("three");
});

it("calls onTypingChange when typing starts or stops", async () => {
	const spy = vi.fn();
	render(Combobox, { onTypingChange: spy, list: oneTwoThree });

	await act(() => screen.getByRole("combobox").focus());

	await userEvent.keyboard("t");
	expect(spy).toHaveBeenCalledTimes(1);
	expect(spy).toHaveBeenCalledWith(true);

	vi.advanceTimersByTime(750);
	expect(spy).toHaveBeenCalledTimes(2);
	expect(spy).toHaveBeenCalledWith(false);
});

it("Menu - skips disabled items and opens submenu on space if no match", async () => {
	vi.useRealTimers();

	render(Menu);

	await userEvent.click(screen.getByText("Edit"));
	await act(async () => {});
	expect(screen.getByRole("menu")).toBeInTheDocument();

	await userEvent.keyboard("copy as ");

	expect(screen.getByText("Copy as").getAttribute("aria-expanded")).toBe(
		"false",
	);

	await sleep(750);
	await userEvent.keyboard(" ");

	await waitFor(() =>
		expect(screen.getByText("Copy as").getAttribute("aria-expanded")).toBe(
			"true",
		),
	);
});

it("Menu - resets once a match is no longer found", async () => {
	vi.useRealTimers();

	render(Menu);

	await userEvent.click(screen.getByText("Edit"));

	expect(screen.getByRole("menu")).toBeInTheDocument();

	await userEvent.keyboard("undr");

	await waitFor(() => expect(screen.getByText("Undo")).toHaveFocus());

	await userEvent.keyboard("r");

	expect(screen.getByText("Redo")).toHaveFocus();
});

it("typing spaces on <div> references does not open the menu", async () => {
	const spy = vi.fn();
	render(Select, { onMatch: spy });

	vi.useFakeTimers({ shouldAdvanceTime: true });

	await userEvent.click(screen.getByRole("combobox"));

	await userEvent.keyboard("h");
	await userEvent.keyboard(" ");

	expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

	vi.advanceTimersByTime(750);

	await userEvent.keyboard(" ");
	await act(async () => {});

	expect(screen.queryByRole("listbox")).toBeInTheDocument();
});
