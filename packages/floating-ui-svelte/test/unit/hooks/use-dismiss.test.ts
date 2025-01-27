import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Dismiss from "./wrapper-components/use-dismiss/dismiss.svelte";
import { sleep, testKbd } from "../../utils.js";
import { userEvent } from "@testing-library/user-event";
import ThirdParty from "./wrapper-components/use-dismiss/third-party.svelte";
import DismissNestedPopovers from "./wrapper-components/use-dismiss/dismiss-nested-popovers.svelte";
import DismissPortaledChildren from "./wrapper-components/use-dismiss/dismiss-portaled-children.svelte";
import { normalizeProp } from "../../../src/index.js";
import DismissNestedNested from "./wrapper-components/use-dismiss/dismiss-nested-nested.svelte";
import DismissWithoutFloatingTree from "./wrapper-components/use-dismiss/dismiss-without-floating-tree.svelte";
import DismissCaptureDialogsMulti from "./wrapper-components/use-dismiss/dismiss-capture-dialogs-multi.svelte";

describe("true", () => {
	it("dismisses with escape key", async () => {
		render(Dismiss);
		await fireEvent.keyDown(document.body, { key: "Escape" });
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("does not dismiss with escape key if IME is active", async () => {
		const onClose = vi.fn();

		render(Dismiss, { onClose, escapeKey: true });

		const textbox = screen.getByRole("textbox");

		await fireEvent.focus(textbox);

		// Simulate behavior when "あ" (Japanese) is entered and Esc is pressed for IME
		// cancellation.
		await fireEvent.change(textbox, { target: { value: "あ" } });
		await fireEvent.compositionStart(textbox);
		await fireEvent.keyDown(textbox, { key: "Escape" });
		await fireEvent.compositionEnd(textbox);

		// Wait for the compositionend timeout tick due to Safari
		await sleep();

		expect(onClose).toHaveBeenCalledTimes(0);

		await fireEvent.keyDown(textbox, { key: "Escape" });

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("dismisses with outside pointer press", async () => {
		render(Dismiss);
		await userEvent.click(document.body);
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("dismisses with reference press", async () => {
		render(Dismiss, { referencePress: true });
		await userEvent.click(screen.getByRole("button"));
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("dismisses with native click", async () => {
		render(Dismiss, { referencePress: true });
		await fireEvent.click(screen.getByRole("button"));
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("dismisses with ancestor scroll", async () => {
		render(Dismiss, { ancestorScroll: true });
		await fireEvent.scroll(window);
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("respects outside press function guard", async () => {
		render(Dismiss, { outsidePress: () => false });
		await userEvent.click(document.body);
		expect(screen.queryByRole("tooltip")).toBeInTheDocument();
	});

	it("ignores outside press for third party elements", async () => {
		render(ThirdParty);
		await act(async () => {});

		const thirdParty = document.createElement("div");
		thirdParty.setAttribute("data-testid", "third-party");
		document.body.appendChild(thirdParty);
		await userEvent.click(thirdParty);
		expect(screen.queryByRole("dialog")).toBeInTheDocument();
		thirdParty.remove();
	});

	describe("does not ignore outside press for nested floating elements", () => {
		it("respects when both are modals", async () => {
			render(DismissNestedPopovers, { modal: [true, true] });
			await act(async () => {});

			const popover1 = screen.getByTestId("popover-1");
			const popover2 = screen.getByTestId("popover-2");
			await userEvent.click(popover2);
			expect(popover1).toBeInTheDocument();
			expect(popover2).toBeInTheDocument();
			await userEvent.click(popover1);
			expect(popover2).not.toBeInTheDocument();
		});

		it("respects when outside is modal and inside is not", async () => {
			render(DismissNestedPopovers, { modal: [true, false] });
			await act(async () => {});

			const popover1 = screen.getByTestId("popover-1");
			const popover2 = screen.getByTestId("popover-2");

			await userEvent.click(popover2);
			expect(popover1).toBeInTheDocument();
			expect(popover2).toBeInTheDocument();
			await userEvent.click(popover1);
			expect(popover2).not.toBeInTheDocument();
		});

		it("respects when inside is modal and outside is not", async () => {
			render(DismissNestedPopovers, { modal: [false, true] });
			await act(async () => {});

			const popover1 = screen.getByTestId("popover-1");
			const popover2 = screen.getByTestId("popover-2");
			await userEvent.click(popover2);
			expect(popover1).toBeInTheDocument();
			expect(popover2).toBeInTheDocument();
			await userEvent.click(popover1);
			expect(popover2).not.toBeInTheDocument();
		});

		it("respects when neither are modals", async () => {
			render(DismissNestedPopovers, { modal: null });
			await act(async () => {});

			const popover1 = screen.getByTestId("popover-1");
			const popover2 = screen.getByTestId("popover-2");
			await userEvent.click(popover2);
			expect(popover1).toBeInTheDocument();
			expect(popover2).toBeInTheDocument();
			await userEvent.click(popover1);
			expect(popover2).not.toBeInTheDocument();
		});
	});
});

describe("false", () => {
	it("dismisses with escape key", async () => {
		render(Dismiss, { escapeKey: false });
		await fireEvent.keyDown(document.body, { key: "Escape" });
		expect(screen.queryByRole("tooltip")).toBeInTheDocument();
	});

	it("dismisses with outside press", async () => {
		render(Dismiss, { outsidePress: false });
		await userEvent.click(document.body);
		expect(screen.queryByRole("tooltip")).toBeInTheDocument();
	});

	it("dismisses with reference pointer down", async () => {
		render(Dismiss, { referencePress: false });
		await userEvent.click(screen.getByRole("button"));
		expect(screen.queryByRole("tooltip")).toBeInTheDocument();
	});

	it("dismisses with ancestor scroll", async () => {
		render(Dismiss, { ancestorScroll: false });
		await fireEvent.scroll(window);
		expect(screen.queryByRole("tooltip")).toBeInTheDocument();
	});

	it("does not dismiss when clicking portaled children", async () => {
		render(DismissPortaledChildren);
		await sleep(100);

		await fireEvent.pointerDown(screen.getByTestId("portaled-button"), {
			bubbles: true,
		});

		await waitFor(() =>
			expect(screen.queryByTestId("portaled-button")).toBeInTheDocument(),
		);
	});

	it("respects outsidePress function guard", async () => {
		render(Dismiss, { outsidePress: () => true });
		await userEvent.click(document.body);
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});
});

describe("bubbles", () => {
	describe("prop resolution", () => {
		it("undefined", () => {
			const { escapeKey: escapeKeyBubbles, outsidePress: outsidePressBubbles } =
				normalizeProp();

			expect(escapeKeyBubbles).toBe(false);
			expect(outsidePressBubbles).toBe(true);
		});

		it("false", () => {
			const { escapeKey: escapeKeyBubbles, outsidePress: outsidePressBubbles } =
				normalizeProp(false);

			expect(escapeKeyBubbles).toBe(false);
			expect(outsidePressBubbles).toBe(false);
		});

		it("{}", () => {
			const { escapeKey: escapeKeyBubbles, outsidePress: outsidePressBubbles } =
				normalizeProp({});

			expect(escapeKeyBubbles).toBe(false);
			expect(outsidePressBubbles).toBe(true);
		});

		it("{ escapeKey: false }", () => {
			const { escapeKey: escapeKeyBubbles, outsidePress: outsidePressBubbles } =
				normalizeProp({
					escapeKey: false,
				});

			expect(escapeKeyBubbles).toBe(false);
			expect(outsidePressBubbles).toBe(true);
		});

		it("{ outsidePress: false }", () => {
			const { escapeKey: escapeKeyBubbles, outsidePress: outsidePressBubbles } =
				normalizeProp({
					outsidePress: false,
				});

			expect(escapeKeyBubbles).toBe(false);
			expect(outsidePressBubbles).toBe(false);
		});
	});

	describe("outsidePress", () => {
		it("true", async () => {
			render(DismissNestedNested);

			expect(screen.queryByTestId("outer")).toBeInTheDocument();
			expect(screen.queryByTestId("inner")).toBeInTheDocument();

			await fireEvent.pointerDown(document.body);

			expect(screen.queryByTestId("outer")).not.toBeInTheDocument();
			expect(screen.queryByTestId("inner")).not.toBeInTheDocument();
		});

		it("false", async () => {
			render(DismissNestedNested, { outsidePress: [false, false] });

			expect(screen.queryByTestId("outer")).toBeInTheDocument();
			expect(screen.queryByTestId("inner")).toBeInTheDocument();

			await fireEvent.pointerDown(document.body);

			await waitFor(() =>
				expect(screen.queryByTestId("outer")).toBeInTheDocument(),
			);
			await waitFor(() =>
				expect(screen.queryByTestId("inner")).not.toBeInTheDocument(),
			);

			await fireEvent.pointerDown(document.body);

			await waitFor(() =>
				expect(screen.queryByTestId("outer")).not.toBeInTheDocument(),
			);
			await waitFor(() =>
				expect(screen.queryByTestId("inner")).not.toBeInTheDocument(),
			);
		});

		it("mixed", async () => {
			render(DismissNestedNested, { outsidePress: [true, false] });

			expect(screen.queryByTestId("outer")).toBeInTheDocument();
			expect(screen.queryByTestId("inner")).toBeInTheDocument();

			await fireEvent.pointerDown(document.body);

			expect(screen.queryByTestId("outer")).toBeInTheDocument();
			expect(screen.queryByTestId("inner")).not.toBeInTheDocument();

			await fireEvent.pointerDown(document.body);

			expect(screen.queryByTestId("outer")).not.toBeInTheDocument();
			expect(screen.queryByTestId("inner")).not.toBeInTheDocument();
		});
	});

	describe("escapeKey", () => {
		it("without FloatingTree", async () => {
			render(DismissWithoutFloatingTree);

			screen.getByTestId("focus-button").focus();
			await waitFor(() =>
				expect(screen.queryByRole("tooltip")).toBeInTheDocument(),
			);

			await userEvent.keyboard(testKbd.ESCAPE);

			expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
			expect(screen.queryByRole("dialog")).toBeInTheDocument();
		});

		it("true", async () => {
			render(DismissNestedNested, { bubbles: true });
			expect(screen.queryByTestId("outer")).toBeInTheDocument();
			expect(screen.queryByTestId("inner")).toBeInTheDocument();

			await userEvent.keyboard(testKbd.ESCAPE);

			expect(screen.queryByTestId("outer")).not.toBeInTheDocument();
			expect(screen.queryByTestId("inner")).not.toBeInTheDocument();
		});

		it("false", async () => {
			render(DismissNestedNested, { escapeKey: [false, false] });

			expect(screen.queryByTestId("outer")).toBeInTheDocument();
			expect(screen.queryByTestId("inner")).toBeInTheDocument();

			await sleep(30);

			await userEvent.keyboard(testKbd.ESCAPE);

			expect(screen.queryByTestId("outer")).toBeInTheDocument();
			await waitFor(() => {
				expect(screen.queryByTestId("inner")).not.toBeInTheDocument();
			});

			await userEvent.keyboard(testKbd.ESCAPE);

			expect(screen.queryByTestId("outer")).not.toBeInTheDocument();
			expect(screen.queryByTestId("inner")).not.toBeInTheDocument();
		});

		it("mixed", async () => {
			render(DismissNestedNested, { escapeKey: [true, false] });

			expect(screen.queryByTestId("outer")).toBeInTheDocument();
			expect(screen.queryByTestId("inner")).toBeInTheDocument();
			await sleep(30);

			await userEvent.keyboard(testKbd.ESCAPE);

			expect(screen.queryByTestId("outer")).toBeInTheDocument();
			expect(screen.queryByTestId("inner")).not.toBeInTheDocument();

			await userEvent.keyboard(testKbd.ESCAPE);

			expect(screen.queryByTestId("outer")).not.toBeInTheDocument();
			expect(screen.queryByTestId("inner")).not.toBeInTheDocument();
		});
	});
});

describe("capture", () => {
	describe("prop resolution", () => {
		it("undefined", () => {
			const { escapeKey: escapeKeyCapture, outsidePress: outsidePressCapture } =
				normalizeProp();

			expect(escapeKeyCapture).toBe(false);
			expect(outsidePressCapture).toBe(true);
		});

		it("{}", () => {
			const { escapeKey: escapeKeyCapture, outsidePress: outsidePressCapture } =
				normalizeProp({});

			expect(escapeKeyCapture).toBe(false);
			expect(outsidePressCapture).toBe(true);
		});

		it("true", () => {
			const { escapeKey: escapeKeyCapture, outsidePress: outsidePressCapture } =
				normalizeProp(true);

			expect(escapeKeyCapture).toBe(true);
			expect(outsidePressCapture).toBe(true);
		});

		it("false", () => {
			const { escapeKey: escapeKeyCapture, outsidePress: outsidePressCapture } =
				normalizeProp(false);

			expect(escapeKeyCapture).toBe(false);
			expect(outsidePressCapture).toBe(false);
		});

		it("{ escapeKey: true }", () => {
			const { escapeKey: escapeKeyCapture, outsidePress: outsidePressCapture } =
				normalizeProp({
					escapeKey: true,
				});

			expect(escapeKeyCapture).toBe(true);
			expect(outsidePressCapture).toBe(true);
		});

		it("{ outsidePress: false }", () => {
			const { escapeKey: escapeKeyCapture, outsidePress: outsidePressCapture } =
				normalizeProp({
					outsidePress: false,
				});

			expect(escapeKeyCapture).toBe(false);
			expect(outsidePressCapture).toBe(false);
		});
	});

	describe("outsidePress", () => {
		it("false", async () => {
			const user = userEvent.setup();

			render(DismissCaptureDialogsMulti, { outsidePress: [false, false] });

			expect(screen.getByText("outer")).toBeInTheDocument();
			expect(screen.getByText("inner")).toBeInTheDocument();

			await sleep(30);

			await user.click(screen.getByText("outer"));

			expect(screen.getByText("outer")).toBeInTheDocument();
			expect(screen.getByText("inner")).toBeInTheDocument();

			await user.click(screen.getByText("outside"));

			expect(screen.getByText("outer")).toBeInTheDocument();
			expect(screen.getByText("inner")).toBeInTheDocument();
		});
	});
});
