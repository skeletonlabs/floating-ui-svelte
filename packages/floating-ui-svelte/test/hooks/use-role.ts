import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import App from "./wrapper-components/use-role.svelte";

describe("useRole", () => {
	describe("default", () => {
		it("applies the `dialog` role to the floating element", () => {
			render(App, { open: true });

			expect(screen.getByTestId("floating")).toHaveAttribute("role", "dialog");
		});
	});

	describe("enabled", () => {
		it("does apply the role when set to `true`", () => {
			render(App, { role: "listbox", open: true });

			expect(screen.getByTestId("floating")).toHaveAttribute("role", "listbox");
		});
		it("does not apply the role when set to `false`", () => {
			render(App, { role: "listbox", open: true, enabled: false });

			expect(screen.getByTestId("floating")).not.toHaveAttribute(
				"role",
				"listbox",
			);
		});
	});

	describe("role", () => {
		describe("dialog", () => {
			it("applies the `dialog` role to the floating element", () => {
				render(App, { role: "dialog", open: true });

				expect(screen.getByTestId("floating")).toHaveAttribute(
					"role",
					"dialog",
				);
			});

			it("applies the `aria-haspopup` attribute to the reference element", () => {
				render(App, { role: "dialog" });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-haspopup",
					"dialog",
				);
			});

			it("applies the `aria-expanded` attribute to the reference element based on `open` state", async () => {
				const { rerender } = render(App, { role: "dialog", open: false });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-expanded",
					"false",
				);

				await rerender({ open: true });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-expanded",
					"true",
				);
			});

			it("applies the `aria-controls` attribute with the correct id to the reference element based on the `open` state", async () => {
				const { rerender } = render(App, { role: "dialog", open: false });

				expect(screen.getByTestId("reference")).not.toHaveAttribute(
					"aria-controls",
				);

				await rerender({ open: true });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-controls",
					screen.getByTestId("floating").id,
				);
			});
		});

		describe("label", () => {
			it("applies the `aria-labelledby` attribute to the reference element", () => {
				render(App, { role: "label", open: true });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-labelledby",
				);
			});
		});

		describe("tooltip", () => {
			it("applies the `tooltip` role to the floating element", () => {
				render(App, { role: "tooltip", open: true });

				expect(screen.getByTestId("floating")).toHaveAttribute(
					"role",
					"tooltip",
				);
			});

			it("applies the `aria-describedby` attribute to the reference element based on the `open` state", async () => {
				const { rerender } = render(App, { role: "tooltip", open: false });

				expect(screen.getByTestId("reference")).not.toHaveAttribute(
					"aria-describedby",
				);

				await rerender({ open: true });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-describedby",
				);
			});
		});

		describe("menu", () => {
			it("applies the `menu` role to the floating element", () => {
				render(App, { role: "menu", open: true });

				expect(screen.getByTestId("floating")).toHaveAttribute("role", "menu");
			});

			it("applies the `aira-haspopup` attribute to the reference element", () => {
				render(App, { role: "menu" });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-haspopup",
					"menu",
				);
			});

			it("applies the `aria-expanded` attribute to the reference element based on the `open` state", async () => {
				const { rerender } = render(App, { role: "menu", open: false });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-expanded",
					"false",
				);

				await rerender({ open: true });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-expanded",
					"true",
				);
			});

			it("applies the `aria-controls` attribute with the correct id to the reference element based on the `open` state", async () => {
				const { rerender } = render(App, { role: "menu", open: false });

				expect(screen.getByTestId("reference")).not.toHaveAttribute(
					"aria-controls",
				);

				await rerender({ open: true });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-controls",
					screen.getByTestId("floating").id,
				);
			});
		});

		describe("listbox", () => {
			it("applies the `listbox` role to the floating element", () => {
				render(App, { role: "listbox", open: true });

				expect(screen.getByTestId("floating")).toHaveAttribute(
					"role",
					"listbox",
				);
			});

			it("applies the `aria-haspopup` attribute to the reference element", () => {
				render(App, { role: "listbox" });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-haspopup",
					"listbox",
				);
			});

			it("applies the `aria-expanded` attribute to the reference element based on the `open` state", async () => {
				const { rerender } = render(App, { role: "listbox", open: false });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-expanded",
					"false",
				);

				await rerender({ open: true });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-expanded",
					"true",
				);
			});

			it("applies the `aria-controls` attribute with the correct id to the reference element based on the `open` state", async () => {
				const { rerender } = render(App, { role: "listbox", open: false });

				expect(screen.getByTestId("reference")).not.toHaveAttribute(
					"aria-controls",
				);

				await rerender({ open: true });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-controls",
					screen.getByTestId("floating").id,
				);
			});
		});

		describe("select", () => {
			it("applies the `listbox` role to the floating element", () => {
				render(App, { role: "select", open: true });

				expect(screen.getByTestId("floating")).toHaveAttribute(
					"role",
					"listbox",
				);
			});

			it("applies the `aria-autocomplete` attribute to the reference element", () => {
				render(App, { role: "select" });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-autocomplete",
					"none",
				);
			});

			it("applies the `aria-expanded` attribute to the reference element based on the `open` state", async () => {
				const { rerender } = render(App, { role: "select", open: false });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-expanded",
					"false",
				);

				await rerender({ open: true });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-expanded",
					"true",
				);
			});

			it("applies the `aria-selected` attribute to the selected item within the floating element", async () => {
				render(App, { role: "select", open: true });

				expect(screen.getByTestId("item-1")).toHaveAttribute(
					"aria-selected",
					"false",
				);
				expect(screen.getByTestId("item-2")).toHaveAttribute(
					"aria-selected",
					"true",
				);
			});
		});

		describe("combobox", () => {
			it("applies the `listbox` role to the floating element", () => {
				render(App, { role: "combobox", open: true });

				expect(screen.getByTestId("floating")).toHaveAttribute(
					"role",
					"listbox",
				);
			});

			it("applies the `aria-autocomplete` attribute to the reference element", () => {
				render(App, { role: "combobox" });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-autocomplete",
					"list",
				);
			});

			it("applies the `aria-expanded` attribute to the reference element based on the `open` state", async () => {
				const { rerender } = render(App, { role: "combobox", open: false });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-expanded",
					"false",
				);

				await rerender({ open: true });

				expect(screen.getByTestId("reference")).toHaveAttribute(
					"aria-expanded",
					"true",
				);
			});
		});
	});
});
