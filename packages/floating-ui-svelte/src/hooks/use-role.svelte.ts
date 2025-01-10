import { useFloatingParentNodeId } from "../components/floating-tree/hooks.svelte.js";
import type { FloatingContext } from "./use-floating.svelte.js";
import { useId } from "./use-id.js";
import type {
	ElementProps,
	ExtendedUserProps,
} from "./use-interactions.svelte.js";

type AriaRole =
	| "tooltip"
	| "dialog"
	| "alertdialog"
	| "menu"
	| "listbox"
	| "grid"
	| "tree";

type ComponentRole = "select" | "label" | "combobox";

interface UseRoleOptions {
	/**
	 * Whether the Hook is enabled, including all internal Effects and event
	 * handlers.
	 * @default true
	 */
	enabled?: boolean;
	/**
	 * The role of the floating element.
	 * @default 'dialog'
	 */
	role?: AriaRole | ComponentRole;
}

const componentRoleToAriaRoleMap = new Map<
	AriaRole | ComponentRole,
	AriaRole | false
>([
	["select", "listbox"],
	["combobox", "listbox"],
	["label", false],
]);

class RoleInteraction {
	#enabled = $derived.by(() => this.options.enabled ?? true);
	#role = $derived.by(() => this.options.role ?? "dialog");
	#ariaRole = $derived(
		(componentRoleToAriaRoleMap.get(this.#role) ?? this.#role) as
			| AriaRole
			| false
			| undefined,
	);
	#parentId: string | null = null;
	#isNested: boolean;
	#referenceId = useId();

	constructor(
		private readonly context: FloatingContext,
		private readonly options: UseRoleOptions = {},
	) {
		this.#parentId = useFloatingParentNodeId();
		this.#isNested = this.#parentId != null;
	}

	reference: ElementProps["reference"] = $derived.by(() => {
		if (!this.#enabled) return {};
		if (this.#ariaRole === "tooltip" || this.#role === "label") {
			return {
				[`aria-${this.#role === "label" ? "labelledby" : "describedby"}`]: this
					.context.open
					? this.context.floatingId
					: undefined,
			};
		}

		return {
			"aria-expanded": this.context.open ? "true" : "false",
			"aria-haspopup":
				this.#ariaRole === "alertdialog" ? "dialog" : this.#ariaRole,
			"aria-controls": this.context.open ? this.context.floatingId : undefined,
			...(this.#ariaRole === "listbox" && { role: "combobox " }),
			...(this.#ariaRole === "menu" && { id: this.#referenceId }),
			...(this.#ariaRole === "menu" && this.#isNested && { role: "menuitem" }),
			...(this.#role === "select" && { "aria-autocomplete": "none" }),
			...(this.#role === "combobox" && { "aria-autocomplete": "list" }),
		};
	});

	floating: ElementProps["floating"] = $derived.by(() => {
		if (!this.#enabled) return {};
		const floatingProps = {
			id: this.context.floatingId,
			...(this.#ariaRole && { role: this.#ariaRole }),
		};

		if (this.#ariaRole === "tooltip" || this.#role === "label") {
			return floatingProps;
		}

		return {
			...floatingProps,
			...(this.#ariaRole === "menu" && {
				"aria-labelledby": this.#referenceId,
			}),
		};
	});

	item: ElementProps["item"] = $derived.by(() => {
		return ({ active, selected }: ExtendedUserProps) => {
			if (!this.#enabled) return {};
			const commonProps = {
				role: "option",
				...(active && { id: `${this.context.floatingId}-option` }),
			};

			switch (this.#role) {
				case "select":
					return {
						...commonProps,
						"aria-selected": active && selected,
					};
				case "combobox": {
					return {
						...commonProps,
						...(active && { "aria-selected": true }),
					};
				}
			}

			return {};
		};
	});

	get enabled() {
		return this.#enabled;
	}
}

function useRole(
	context: FloatingContext,
	options: UseRoleOptions = {},
): ElementProps {
	return new RoleInteraction(context, options);
}

export type { UseRoleOptions };
export { useRole, RoleInteraction };
