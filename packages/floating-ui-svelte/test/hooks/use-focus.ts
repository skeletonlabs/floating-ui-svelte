import { fireEvent, render, screen } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useFloating, useFocus, useId } from "../../src/index.js";
import { withRunes } from "../internal/with-runes.svelte.js";
import App from "./wrapper-components/use-focus.svelte";

/**
 * This test suite is skipped because `useFocus` heavily depends on the environment and JSDom can't deliver that environment (nor can happy-dom)
 * Due to the inconsistent results across machines these tests are meaningless, although correct.
 */
describe.skip("useFocus", () => {
	describe("default", () => {
		it("changes the open state to `true` on focus", async () => {
			render(App);

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();

			await fireEvent.focus(screen.getByTestId("reference"));

			expect(screen.getByTestId("floating")).toBeInTheDocument();
		});

		it("changes the open state to `false` on blur", async () => {
			render(App);

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();

			await fireEvent.focus(screen.getByTestId("reference"));

			expect(screen.getByTestId("floating")).toBeInTheDocument();

			await fireEvent.blur(screen.getByTestId("reference"));

			await vi.waitFor(() => {
				expect(screen.queryByTestId("floating")).not.toBeInTheDocument();
			});
		});
	});

	describe("enabled", () => {
		it("does enable the hook when set to `true`", async () => {
			render(App, { enabled: true });

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();

			await fireEvent.focus(screen.getByTestId("reference"));

			expect(screen.getByTestId("floating")).toBeInTheDocument();
		});

		it("does not enable the hook when set to `false`", async () => {
			render(App, { enabled: false });

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();

			await fireEvent.focus(screen.getByTestId("reference"));

			await vi.waitFor(() => {
				expect(screen.queryByTestId("floating")).not.toBeInTheDocument();
			});
		});
	});

	describe("visibleOnly", () => {
		it("does change the open state to `true` on focus when set to `true`", async () => {
			render(App, { visibleOnly: true });

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();

			await fireEvent.focus(screen.getByTestId("reference"));

			expect(screen.getByTestId("floating")).toBeInTheDocument();
		});

		it("does not change the open state to `true` on click (focus, but not focus-within) when set to `true`", async () => {
			render(App, { visibleOnly: true });

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();

			await userEvent.click(screen.getByTestId("reference"));

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();
		});

		it("does change the open state to `true` on focus when set to `false`", async () => {
			render(App, { visibleOnly: false });

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();

			await fireEvent.focus(screen.getByTestId("reference"));

			expect(screen.queryByTestId("floating")).toBeInTheDocument();
		});

		it("does change the open state to `true` on click (focus, but not focus-within) when set to `false`", async () => {
			render(App, { visibleOnly: false });

			expect(screen.queryByTestId("floating")).not.toBeInTheDocument();

			await userEvent.click(screen.getByTestId("reference"));

			expect(screen.queryByTestId("floating")).toBeInTheDocument();
		});
	});
});

describe("focusWithin", () => {
	function createElements(): { reference: HTMLElement; floating: HTMLElement } {
		const reference = document.createElement("div");
		const floating = document.createElement("div");
		reference.id = useId();
		floating.id = useId();
		return { reference, floating };
	}

	it(
		"Should not output onfocusin or onfocusout event handlers",
		withRunes(() => {
			expect.assertions(2);

			const elements = createElements();
			const floating = useFloating({ elements });
			const focus = useFocus(floating.context);
			const handlers = focus.reference;

			expect(handlers).not.toHaveProperty("onfocusin");
			expect(handlers).not.toHaveProperty("onfocusout");
		}),
	);

	it(
		"Should output onfocusin or onfocusout event handlers",
		withRunes(() => {
			expect.assertions(2);

			const elements = createElements();
			const floating = useFloating({ elements });
			const focus = useFocus(floating.context, { focusWithin: true });
			const handlers = focus.reference;

			expect(handlers).toHaveProperty("onfocusin");
			expect(handlers).toHaveProperty("onfocusout");
		}),
	);
});
