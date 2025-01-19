import { act, fireEvent, render, screen } from "@testing-library/svelte";
import { expect, it, vi } from "vitest";
import Main from "./components/main.svelte";

vi.useFakeTimers();

it("groups delays correctly", async () => {
	render(Main);

	await fireEvent.mouseEnter(screen.getByTestId("reference-one"));

	await act(async () => {
		vi.advanceTimersByTime(1);
	});

	expect(screen.queryByTestId("floating-one")).not.toBeInTheDocument();

	await act(async () => {
		vi.advanceTimersByTime(999);
	});

	expect(screen.queryByTestId("floating-one")).toBeInTheDocument();
	await fireEvent.mouseEnter(screen.getByTestId("reference-two"));

	await act(async () => {
		vi.advanceTimersByTime(1);
	});

	expect(screen.queryByTestId("floating-one")).not.toBeInTheDocument();
	expect(screen.queryByTestId("floating-two")).toBeInTheDocument();

	await fireEvent.mouseEnter(screen.getByTestId("reference-three"));

	await act(async () => {
		vi.advanceTimersByTime(1);
	});

	expect(screen.queryByTestId("floating-two")).not.toBeInTheDocument();
	expect(screen.queryByTestId("floating-three")).toBeInTheDocument();

	await fireEvent.mouseLeave(screen.getByTestId("reference-three"));

	await act(async () => {
		vi.advanceTimersByTime(1);
	});

	expect(screen.queryByTestId("floating-three")).toBeInTheDocument();
	await act(async () => {
		vi.advanceTimersByTime(199);
	});

	expect(screen.queryByTestId("floating-three")).not.toBeInTheDocument();
});

it("respects timeoutMs prop", async () => {
	render(Main, { timeoutMs: 500 });

	await fireEvent.mouseEnter(screen.getByTestId("reference-one"));

	await act(async () => {
		vi.advanceTimersByTime(1000);
	});

	await fireEvent.mouseLeave(screen.getByTestId("reference-one"));

	expect(screen.queryByTestId("floating-one")).toBeInTheDocument();

	await act(async () => {
		vi.advanceTimersByTime(499);
	});

	expect(screen.queryByTestId("floating-one")).not.toBeInTheDocument();

	await fireEvent.mouseEnter(screen.getByTestId("reference-two"));

	await act(async () => {
		vi.advanceTimersByTime(1);
	});

	expect(screen.queryByTestId("floating-two")).toBeInTheDocument();

	await fireEvent.mouseEnter(screen.getByTestId("reference-three"));

	await act(async () => {
		vi.advanceTimersByTime(1);
	});

	expect(screen.queryByTestId("floating-two")).not.toBeInTheDocument();
	expect(screen.queryByTestId("floating-three")).toBeInTheDocument();

	await fireEvent.mouseLeave(screen.getByTestId("reference-three"));

	await act(async () => {
		vi.advanceTimersByTime(1);
	});

	expect(screen.queryByTestId("floating-three")).toBeInTheDocument();

	await act(async () => {
		vi.advanceTimersByTime(99);
	});

	expect(screen.queryByTestId("floating-three")).not.toBeInTheDocument();
});
