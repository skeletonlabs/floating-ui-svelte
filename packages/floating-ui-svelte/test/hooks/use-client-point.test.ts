import type { Coords } from "../../src/types.js";
import { screen, fireEvent, render, waitFor } from "@testing-library/svelte";
import { expect, it } from "vitest";
import UseClientPoint from "./wrapper-components/use-client-point.svelte";
import { sleep } from "../internal/utils.js";

function expectLocation({ x, y }: Coords) {
	expect(Number(screen.getByTestId("x")?.textContent)).toBe(x);
	expect(Number(screen.getByTestId("y")?.textContent)).toBe(y);
	expect(Number(screen.getByTestId("width")?.textContent)).toBe(0);
	expect(Number(screen.getByTestId("height")?.textContent)).toBe(0);
}

it("renders at explicit client point and can be updated", async () => {
	render(UseClientPoint, { x: 0, y: 0 });

	await fireEvent.click(screen.getByTestId("toggle-open"));

	expectLocation({ x: 0, y: 0 });

	await fireEvent.click(screen.getByTestId("set-point"));
	await sleep(10);

	expectLocation({ x: 1000, y: 1000 });
});

it("renders at mouse event coords", async () => {
	render(UseClientPoint);

	await fireEvent(
		screen.getByTestId("reference"),
		new MouseEvent("mousemove", {
			bubbles: true,
			clientX: 500,
			clientY: 500,
		}),
	);

	expectLocation({ x: 500, y: 500 });

	await fireEvent(
		screen.getByTestId("reference"),
		new MouseEvent("mousemove", {
			bubbles: true,
			clientX: 1000,
			clientY: 1000,
		}),
	);

	expectLocation({ x: 1000, y: 1000 });

	// Window listener isn't registered unless the floating element is open.
	await fireEvent(
		window,
		new MouseEvent("mousemove", {
			bubbles: true,
			clientX: 700,
			clientY: 700,
		}),
	);

	expectLocation({ x: 1000, y: 1000 });

	await fireEvent.click(screen.getByTestId("toggle-open"));

	await fireEvent(
		screen.getByTestId("reference"),
		new MouseEvent("mousemove", {
			bubbles: true,
			clientX: 700,
			clientY: 700,
		}),
	);

	expectLocation({ x: 700, y: 700 });

	await fireEvent(
		document.body,
		new MouseEvent("mousemove", {
			bubbles: true,
			clientX: 0,
			clientY: 0,
		}),
	);

	expectLocation({ x: 0, y: 0 });
});

it("ignores mouse when explicit coords are specified", async () => {
	render(UseClientPoint, { x: 0, y: 0 });

	await fireEvent(
		screen.getByTestId("reference"),
		new MouseEvent("mousemove", {
			bubbles: true,
			clientX: 500,
			clientY: 500,
		}),
	);

	expectLocation({ x: 0, y: 0 });
});

it("cleans up window listener when closing or disabling", async () => {
	render(UseClientPoint);

	await fireEvent.click(screen.getByTestId("toggle-open"));

	await fireEvent(
		screen.getByTestId("reference"),
		new MouseEvent("mousemove", {
			bubbles: true,
			clientX: 500,
			clientY: 500,
		}),
	);

	await fireEvent.click(screen.getByTestId("toggle-open"));

	await fireEvent(
		document.body,
		new MouseEvent("mousemove", {
			bubbles: true,
			clientX: 0,
			clientY: 0,
		}),
	);

	expectLocation({ x: 500, y: 500 });

	await fireEvent.click(screen.getByTestId("toggle-open"));

	await fireEvent(
		document.body,
		new MouseEvent("mousemove", {
			bubbles: true,
			clientX: 500,
			clientY: 500,
		}),
	);

	expectLocation({ x: 500, y: 500 });

	await fireEvent.click(screen.getByTestId("toggle-enabled"));

	await fireEvent(
		document.body,
		new MouseEvent("mousemove", {
			bubbles: true,
			clientX: 0,
			clientY: 0,
		}),
	);

	expectLocation({ x: 500, y: 500 });
});

it("respects axis x", async () => {
	render(UseClientPoint, { axis: "x" });

	await fireEvent.click(screen.getByTestId("toggle-open"));

	await fireEvent(
		screen.getByTestId("reference"),
		new MouseEvent("mousemove", {
			bubbles: true,
			clientX: 500,
			clientY: 500,
		}),
	);

	expectLocation({ x: 500, y: 0 });
});

it("respects axis y", async () => {
	render(UseClientPoint, { axis: "y" });

	await fireEvent.click(screen.getByTestId("toggle-open"));

	await fireEvent(
		screen.getByTestId("reference"),
		new MouseEvent("mousemove", {
			bubbles: true,
			clientX: 500,
			clientY: 500,
		}),
	);

	expectLocation({ x: 0, y: 500 });
});

it("removes window listener when cursor lands on floating element", async () => {
	render(UseClientPoint);
	await fireEvent.click(screen.getByTestId("toggle-open"));

	await fireEvent(
		screen.getByTestId("reference"),
		new MouseEvent("mousemove", {
			bubbles: true,
			clientX: 500,
			clientY: 500,
		}),
	);

	await fireEvent(
		screen.getByTestId("floating"),
		new MouseEvent("mousemove", {
			bubbles: true,
			clientX: 500,
			clientY: 500,
		}),
	);

	await fireEvent(
		document.body,
		new MouseEvent("mousemove", {
			bubbles: true,
			clientX: 0,
			clientY: 0,
		}),
	);

	expectLocation({ x: 500, y: 500 });
});
