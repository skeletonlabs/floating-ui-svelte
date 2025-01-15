import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Main from "./components/main.svelte";
import NestedNested from "./components/nested-nested.svelte";
import DialogNonFocusableRef from "./components/dialog-non-focusable-ref.svelte";
import { userEvent } from "@testing-library/user-event";
import { sleep, testKbd } from "../../internal/utils.js";
import DialogFallbackRef from "./components/dialog-fallback-ref.svelte";
import Combobox from "./components/combobox.svelte";
import FloatingFallback from "./components/floating-fallback.svelte";
import MixedModMain from "./components/mixed-mod-main.svelte";
import OutsideNodes from "./components/outside-nodes.svelte";
import ToggleDisabled from "./components/toggle-disabled.svelte";
import KeepMounted from "./components/keep-mounted.svelte";

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

	it("return to reference for nested", async () => {
		render(NestedNested);

		screen.getByTestId("open-dialog").focus();
		await userEvent.keyboard(testKbd.ENTER);

		await fireEvent.click(screen.getByTestId("open-nested-dialog"));

		expect(screen.queryByTestId("close-nested-dialog")).toBeInTheDocument();

		await userEvent.click(document.body);

		expect(screen.queryByTestId("close-nested-dialog")).not.toBeInTheDocument();

		expect(screen.queryByTestId("close-dialog")).toBeInTheDocument();

		await userEvent.keyboard(testKbd.ESCAPE);

		expect(screen.queryByTestId("close-dialog")).not.toBeInTheDocument();
		expect(screen.getByTestId("open-dialog")).toHaveFocus();
	});

	it("returns to the first focusable descendent of the reference if the reference is not focusable", async () => {
		render(DialogNonFocusableRef);

		screen.getByTestId("open-dialog").focus();
		await userEvent.keyboard(testKbd.ENTER);

		expect(screen.queryByTestId("close-dialog")).toBeInTheDocument();

		await userEvent.keyboard(testKbd.ESCAPE);

		expect(screen.queryByTestId("close-dialog")).not.toBeInTheDocument();

		expect(screen.getByTestId("open-dialog")).toHaveFocus();
	});

	it("preserves tabbable context next to reference element if removed (modal)", async () => {
		render(DialogFallbackRef);

		await fireEvent.click(screen.getByTestId("reference"));
		await fireEvent.click(screen.getByTestId("remove"));
		await userEvent.tab();
		expect(screen.getByTestId("fallback")).toHaveFocus();
	});

	it("preserves tabbable context next to reference element if removed (non-modal)", async () => {
		render(DialogFallbackRef, { modal: false });

		await fireEvent.click(screen.getByTestId("reference"));
		await fireEvent.click(screen.getByTestId("remove"));
		await userEvent.tab();
		expect(screen.getByTestId("fallback")).toHaveFocus();
	});
});

describe("guards", () => {
	it("respects true", async () => {
		render(Main, { guards: true });

		await fireEvent.click(screen.getByTestId("reference"));

		await userEvent.tab();
		await userEvent.tab();
		await userEvent.tab();

		expect(document.body).not.toHaveFocus();
	});
	it("respects false", async () => {
		render(Main, { guards: false });
		await fireEvent.click(screen.getByTestId("reference"));

		await userEvent.tab();
		await userEvent.tab();
		await userEvent.tab();

		expect(document.activeElement).toHaveAttribute("data-floating-ui-inert");
	});
});

describe("modal", () => {
	it("respects true", async () => {
		render(Main, { modal: true });
		await fireEvent.click(screen.getByTestId("reference"));

		await waitFor(() => expect(screen.getByTestId("one")).toHaveFocus());

		await userEvent.tab();
		await waitFor(() => expect(screen.getByTestId("two")).toHaveFocus());

		await userEvent.tab();
		await waitFor(() => expect(screen.getByTestId("three")).toHaveFocus());

		await userEvent.tab();
		await waitFor(() => expect(screen.getByTestId("one")).toHaveFocus());

		await userEvent.tab({ shift: true });
		await waitFor(() => expect(screen.getByTestId("three")).toHaveFocus());

		await userEvent.tab({ shift: true });
		await waitFor(() => expect(screen.getByTestId("two")).toHaveFocus());

		await userEvent.tab({ shift: true });
		await waitFor(() => expect(screen.getByTestId("one")).toHaveFocus());

		await userEvent.tab({ shift: true });
		await waitFor(() => expect(screen.getByTestId("three")).toHaveFocus());

		await userEvent.tab();
		await waitFor(() => expect(screen.getByTestId("one")).toHaveFocus());
	});

	it("respects false", async () => {
		render(Main, { modal: false });
		await fireEvent.click(screen.getByTestId("reference"));
		await waitFor(() => expect(screen.getByTestId("one")).toHaveFocus());
		await userEvent.tab();
		await waitFor(() => expect(screen.getByTestId("two")).toHaveFocus());

		await userEvent.tab();
		await waitFor(() => expect(screen.getByTestId("three")).toHaveFocus());

		await userEvent.tab();

		// Focus leaving the floating element closes it.
		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		);

		expect(screen.getByTestId("last")).toHaveFocus();
	});

	it("false - shift tabbing does not trap focus when reference is in order", async () => {
		render(Main, { modal: false, order: ["reference", "content"] });
		await fireEvent.click(screen.getByTestId("reference"));

		await userEvent.tab();
		await userEvent.tab({ shift: true });
		await userEvent.tab({ shift: true });

		await waitFor(() =>
			expect(screen.queryByRole("dialog")).toBeInTheDocument(),
		);
	});

	it("true - combobox hide all other nodes with aria-hidden", async () => {
		render(Combobox);

		await fireEvent.focus(screen.getByTestId("reference"));

		expect(screen.getByTestId("reference")).not.toHaveAttribute("aria-hidden");
		expect(screen.getByTestId("floating")).not.toHaveAttribute("aria-hidden");
		expect(screen.getByTestId("btn-1")).toHaveAttribute("aria-hidden");
		expect(screen.getByTestId("btn-2")).toHaveAttribute("aria-hidden");
	});

	it("true - combobox hide all other nodes with inert when outsideElementsInert=true", async () => {
		render(Combobox, { outsideElementsInert: true });

		await fireEvent.focus(screen.getByTestId("reference"));

		expect(screen.getByTestId("reference")).not.toHaveAttribute("inert");
		expect(screen.getByTestId("floating")).not.toHaveAttribute("inert");
		await waitFor(() =>
			expect(screen.getByTestId("btn-1")).toHaveAttribute("inert"),
		);
		await waitFor(() =>
			expect(screen.getByTestId("btn-2")).toHaveAttribute("inert"),
		);
	});

	it("false - comboboxes do not hide all other nodes", async () => {
		render(Combobox, { modal: false });

		await fireEvent.focus(screen.getByTestId("reference"));

		expect(screen.getByTestId("reference")).not.toHaveAttribute("inert");
		expect(screen.getByTestId("floating")).not.toHaveAttribute("inert");
		expect(screen.getByTestId("btn-1")).not.toHaveAttribute("inert");
		expect(screen.getByTestId("btn-2")).not.toHaveAttribute("inert");
	});

	it("falls back to the floating element when it has no tabbable content", async () => {
		render(FloatingFallback);

		await waitFor(() => expect(screen.getByTestId("floating")).toHaveFocus());
		await userEvent.tab();
		await waitFor(() => expect(screen.getByTestId("floating")).toHaveFocus());
		await userEvent.tab({ shift: true });
		await waitFor(() => expect(screen.getByTestId("floating")).toHaveFocus());
	});

	it("correctly handles mixed modality and nesting ", async () => {
		render(MixedModMain);

		await userEvent.click(screen.getByTestId("open-dialog"));
		await userEvent.click(screen.getByTestId("open-nested-dialog"));

		expect(screen.queryByTestId("close-dialog")).toBeInTheDocument();
		expect(screen.queryByTestId("close-nested-dialog")).toBeInTheDocument();
	});

	it("true - applies aria-hidden to outside nodes", async () => {
		render(OutsideNodes);
		await fireEvent.click(screen.getByTestId("reference"));

		expect(screen.getByTestId("reference")).toHaveAttribute(
			"aria-hidden",
			"true",
		);
		expect(screen.getByTestId("floating")).not.toHaveAttribute("aria-hidden");
		expect(screen.getByTestId("aria-live")).not.toHaveAttribute("aria-hidden");
		expect(screen.getByTestId("btn-1")).toHaveAttribute("aria-hidden", "true");
		expect(screen.getByTestId("btn-2")).toHaveAttribute("aria-hidden", "true");

		await fireEvent.click(screen.getByTestId("reference"));

		expect(screen.getByTestId("reference")).not.toHaveAttribute("aria-hidden");
		expect(screen.getByTestId("aria-live")).not.toHaveAttribute("aria-hidden");
		expect(screen.getByTestId("btn-1")).not.toHaveAttribute("aria-hidden");
		expect(screen.getByTestId("btn-2")).not.toHaveAttribute("aria-hidden");
	});

	it("true - applies inert to outside nodes when outsideElementsInert=true", async () => {
		render(OutsideNodes, { outsideElementsInert: true });
		await fireEvent.click(screen.getByTestId("reference"));

		expect(screen.getByTestId("reference")).toHaveAttribute("inert");
		expect(screen.getByTestId("floating")).not.toHaveAttribute("inert");
		expect(screen.getByTestId("aria-live")).not.toHaveAttribute("inert");
		expect(screen.getByTestId("btn-1")).toHaveAttribute("inert");
		expect(screen.getByTestId("btn-2")).toHaveAttribute("inert");

		await fireEvent.click(screen.getByTestId("reference"));

		expect(screen.getByTestId("reference")).not.toHaveAttribute("inert");
		expect(screen.getByTestId("aria-live")).not.toHaveAttribute("inert");
		expect(screen.getByTestId("btn-1")).not.toHaveAttribute("inert");
		expect(screen.getByTestId("btn-2")).not.toHaveAttribute("inert");
	});

	it("false - does not apply inert to outside nodes", async () => {
		render(OutsideNodes, { modal: false });
		await fireEvent.click(screen.getByTestId("reference"));

		expect(screen.getByTestId("floating")).not.toHaveAttribute("inert");
		expect(screen.getByTestId("aria-live")).not.toHaveAttribute("inert");
		expect(screen.getByTestId("btn-1")).not.toHaveAttribute("inert");
		expect(screen.getByTestId("btn-2")).not.toHaveAttribute("inert");
		expect(screen.getByTestId("reference")).toHaveAttribute(
			"data-floating-ui-inert",
		);
		expect(screen.getByTestId("btn-1")).toHaveAttribute(
			"data-floating-ui-inert",
		);
		expect(screen.getByTestId("btn-2")).toHaveAttribute(
			"data-floating-ui-inert",
		);

		await fireEvent.click(screen.getByTestId("reference"));

		expect(screen.getByTestId("reference")).not.toHaveAttribute(
			"data-floating-ui-inert",
		);
		expect(screen.getByTestId("btn-1")).not.toHaveAttribute(
			"data-floating-ui-inert",
		);
		expect(screen.getByTestId("btn-2")).not.toHaveAttribute(
			"data-floating-ui-inert",
		);
	});
});

describe("disabled", () => {
	it("respects true -> false", async () => {
		render(ToggleDisabled);

		await fireEvent.click(screen.getByTestId("reference"));
		expect(screen.getByTestId("floating")).not.toHaveFocus();
		await waitFor(() =>
			expect(screen.getByTestId("floating")).not.toHaveFocus(),
		);
		await fireEvent.click(screen.getByTestId("toggle"));
		await waitFor(() => expect(screen.getByTestId("floating")).toHaveFocus());
	});

	it("respects false", async () => {
		render(ToggleDisabled, { disabled: false });

		await fireEvent.click(screen.getByTestId("reference"));
		await waitFor(() => expect(screen.getByTestId("floating")).toHaveFocus());
	});

	it("supports keepMounted behavior", async () => {
		render(KeepMounted);

		expect(screen.getByTestId("floating")).not.toHaveFocus();

		await fireEvent.click(screen.getByTestId("reference"));

		await waitFor(() => expect(screen.getByTestId("child")).toHaveFocus());

		await userEvent.tab();

		await waitFor(() => expect(screen.getByTestId("after")).toHaveFocus());

		await userEvent.tab({ shift: true });

		await fireEvent.click(screen.getByTestId("reference"));

		await waitFor(() => expect(screen.getByTestId("child")).toHaveFocus());

		await userEvent.keyboard(testKbd.ESCAPE);

		await waitFor(() => expect(screen.getByTestId("reference")).toHaveFocus());
	});
});
