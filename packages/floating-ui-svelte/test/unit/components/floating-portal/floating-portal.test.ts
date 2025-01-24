import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/svelte";
import { expect, it } from "vitest";
import Main from "./components/main.svelte";
import { sleep } from "../../../utils.js";

it("creates a custom id node", async () => {
	render(Main, { id: "custom-id" });

	await waitFor(() =>
		expect(document.querySelector("#custom-id")).toBeInTheDocument(),
	);
	const customId = document.getElementById("custom-id");
	customId?.remove();
});

it("uses a custom id node as the root", async () => {
	const customRoot = document.createElement("div");
	customRoot.id = "custom-root";
	document.body.appendChild(customRoot);
	render(Main, { id: "custom-root" });
	await fireEvent.click(screen.getByTestId("reference"));
	await sleep(200);
	await act(async () => {});
	await waitFor(() => {
		expect(screen.getByTestId("floating").parentElement?.parentElement).toBe(
			customRoot,
		);
	});
	customRoot.remove();
});
