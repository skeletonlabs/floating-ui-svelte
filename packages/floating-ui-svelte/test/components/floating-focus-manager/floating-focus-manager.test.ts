import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, it, test, vi } from "vitest";
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
import NonModalFloatingPortal from "./components/non-modal-floating-portal.svelte";
import Navigation from "../navigation/main.svelte";
import Drawer from "../drawer/main.svelte";

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

describe("order", () => {
	it("handles [reference, content]", async () => {
		render(Main, { order: ["reference", "content"] });
		await fireEvent.click(screen.getByTestId("reference"));

		await waitFor(() => expect(screen.getByTestId("reference")).toHaveFocus());

		await userEvent.tab();
		await waitFor(() => expect(screen.getByTestId("one")).toHaveFocus());

		await userEvent.tab();
		await waitFor(() => expect(screen.getByTestId("two")).toHaveFocus());
	});

	it("handles [floating, content]", async () => {
		render(Main, { order: ["floating", "content"] });

		await fireEvent.click(screen.getByTestId("reference"));

		await waitFor(() => expect(screen.getByTestId("floating")).toHaveFocus());

		await userEvent.tab();
		await waitFor(() => expect(screen.getByTestId("one")).toHaveFocus());

		await userEvent.tab();
		await waitFor(() => expect(screen.getByTestId("two")).toHaveFocus());

		await userEvent.tab();
		await waitFor(() => expect(screen.getByTestId("three")).toHaveFocus());

		await userEvent.tab();
		await waitFor(() => expect(screen.getByTestId("floating")).toHaveFocus());

		await userEvent.tab({ shift: true });
		await waitFor(() => expect(screen.getByTestId("three")).toHaveFocus());

		await userEvent.tab({ shift: true });
		await waitFor(() => expect(screen.getByTestId("two")).toHaveFocus());

		await userEvent.tab({ shift: true });
		await waitFor(() => expect(screen.getByTestId("one")).toHaveFocus());

		await userEvent.tab({ shift: true });
		await waitFor(() => expect(screen.getByTestId("floating")).toHaveFocus());
	});

	it("handles [reference, floating, content]", async () => {
		render(Main, { order: ["reference", "floating", "content"] });
		await fireEvent.click(screen.getByTestId("reference"));

		await waitFor(() => expect(screen.getByTestId("reference")).toHaveFocus());

		await userEvent.tab();
		await waitFor(() => expect(screen.getByTestId("floating")).toHaveFocus());

		await userEvent.tab();
		await waitFor(() => expect(screen.getByTestId("one")).toHaveFocus());

		await userEvent.tab();
		await waitFor(() => expect(screen.getByTestId("two")).toHaveFocus());

		await userEvent.tab();
		await waitFor(() => expect(screen.getByTestId("three")).toHaveFocus());

		await userEvent.tab();
		await waitFor(() => expect(screen.getByTestId("reference")).toHaveFocus());

		await userEvent.tab({ shift: true });
		await waitFor(() => expect(screen.getByTestId("three")).toHaveFocus());

		await userEvent.tab({ shift: true });
		await userEvent.tab({ shift: true });
		await userEvent.tab({ shift: true });
		await userEvent.tab({ shift: true });

		await waitFor(() => expect(screen.getByTestId("reference")).toHaveFocus());
	});
});

describe("non-modal + FloatingPortal", () => {
	it("focuses inside element, tabbing out focuses last document element", async () => {
		render(NonModalFloatingPortal);
		await userEvent.click(screen.getByTestId("reference"));

		await waitFor(() => expect(screen.getByTestId("inside")).toHaveFocus());

		await userEvent.tab();

		await waitFor(() =>
			expect(screen.queryByTestId("floating")).not.toBeInTheDocument(),
		);
		await waitFor(() => expect(screen.getByTestId("last")).toHaveFocus());
	});

	it("handles order: [reference, content] focuses reference, then inside, then, last document element", async () => {
		render(NonModalFloatingPortal, { order: ["reference", "content"] });

		await userEvent.click(screen.getByTestId("reference"));
		await waitFor(() => expect(screen.getByTestId("reference")).toHaveFocus());
		await sleep(20);
		await userEvent.tab();

		await waitFor(() => expect(screen.getByTestId("inside")).toHaveFocus());

		await userEvent.tab();

		await waitFor(() => expect(screen.getByTestId("last")).toHaveFocus());
	});

	it("handles order: [reference, floating, content] focuses reference, then floating, then inside, then, last document element", async () => {
		render(NonModalFloatingPortal, {
			order: ["reference", "floating", "content"],
		});

		await userEvent.click(screen.getByTestId("reference"));
		await waitFor(() => expect(screen.getByTestId("reference")).toHaveFocus());
		await sleep(20);

		await userEvent.tab();

		await waitFor(() => expect(screen.getByTestId("floating")).toHaveFocus());

		await userEvent.tab();

		await waitFor(() => expect(screen.getByTestId("inside")).toHaveFocus());

		await userEvent.tab();

		await waitFor(() => expect(screen.getByTestId("last")).toHaveFocus());
	});

	it("handles shift + tab", async () => {
		render(NonModalFloatingPortal);

		await userEvent.click(screen.getByTestId("reference"));
		await waitFor(() =>
			expect(screen.queryByTestId("floating")).toBeInTheDocument(),
		);
		await sleep(20);
		await userEvent.tab({ shift: true });

		expect(screen.queryByTestId("floating")).toBeInTheDocument();

		await userEvent.tab({ shift: true });

		expect(screen.queryByTestId("floating")).not.toBeInTheDocument();
	});
});

describe("Navigation", () => {
	it("does not focus reference when hovering it", async () => {
		render(Navigation);
		await userEvent.hover(screen.getByText("Product"));
		await userEvent.unhover(screen.getByText("Product"));
		expect(screen.getByText("Product")).not.toHaveFocus();
	});

	it("returns focus to reference when floating element was opened by hover but is closed by esc key", async () => {
		render(Navigation);
		await userEvent.hover(screen.getByText("Product"));
		await userEvent.keyboard(testKbd.ESCAPE);
		expect(screen.getByText("Product")).toHaveFocus();
	});

	it("returns focus to reference when floating element was opened by hover but is closed by an explicit close action", async () => {
		render(Navigation);
		await userEvent.hover(screen.getByText("Product"));

		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		await userEvent.click(screen.getByText("Close").parentElement!);
		await userEvent.keyboard(testKbd.TAB);
		await waitFor(() => expect(screen.getByText("Close")).toHaveFocus());
		await userEvent.keyboard(testKbd.ENTER);
		await sleep(20);

		await waitFor(() => expect(screen.getByText("Product")).toHaveFocus());
	});

	it("does not re-open after closing via escape key", async () => {
		render(Navigation);
		await userEvent.hover(screen.getByText("Product"));
		await userEvent.keyboard(testKbd.ESCAPE);
		expect(screen.queryByText("Link 1")).not.toBeInTheDocument();
	});

	it("closes when unhovering floating element even when focus is inside it", async () => {
		render(Navigation);
		await userEvent.hover(screen.getByText("Product"));
		await userEvent.click(screen.getByTestId("subnavigation"));
		await userEvent.unhover(screen.getByTestId("subnavigation"));
		await userEvent.hover(screen.getByText("Product"));
		await userEvent.unhover(screen.getByText("Product"));
		expect(screen.queryByTestId("subnavigation")).not.toBeInTheDocument();
	});
});

describe("Drawer", () => {
	window.matchMedia = vi.fn().mockImplementation((query) => ({
		matches: true,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	}));
	it("does not close when clicking another button outside", async () => {
		render(Drawer);

		await userEvent.click(screen.getByText("My button"));
		expect(screen.queryByText("Close")).toBeInTheDocument();
		await userEvent.click(screen.getByText("Next button"));
		await waitFor(() =>
			expect(screen.queryByText("Close")).toBeInTheDocument(),
		);
	});

	it("closeOnFocusOut=false - does not close when tabbing out", async () => {
		render(Drawer);

		await userEvent.click(screen.getByText("My button"));
		await sleep(20);
		expect(screen.queryByText("Close")).toBeInTheDocument();
		await userEvent.keyboard(testKbd.TAB);
		await waitFor(() =>
			expect(document.activeElement).toBe(screen.getByText("Next button")),
		);
		expect(screen.queryByText("Close")).toBeInTheDocument();
	});

	it("returns focus when tabbing out then back to close button", async () => {
		render(Drawer);

		await userEvent.click(screen.getByText("My button"));
		await sleep(20);
		expect(screen.queryByText("Close")).toBeInTheDocument();
		await userEvent.keyboard(testKbd.TAB);
		await waitFor(() => expect(screen.getByText("Next button")).toHaveFocus());
		await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
		await sleep(20);
		await waitFor(() => expect(screen.getByText("Close")).toHaveFocus());
		await userEvent.click(screen.getByText("Close"));
		await waitFor(() => expect(screen.getByText("My button")).toHaveFocus());
	});
});
