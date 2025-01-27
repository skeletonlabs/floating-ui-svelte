import { useFloatingParentNodeId } from "../components/floating-tree/hooks.svelte.js";
import { extract } from "../internal/extract.js";
import type { MaybeGetter } from "../types.js";
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
	enabled?: MaybeGetter<boolean>;
	/**
	 * The role of the floating element.
	 * @default 'dialog'
	 */
	role?: MaybeGetter<AriaRole | ComponentRole>;
}

const componentRoleToAriaRoleMap = new Map<
	AriaRole | ComponentRole,
	AriaRole | false
>([
	["select", "listbox"],
	["combobox", "listbox"],
	["label", false],
]);

function useRole(
	context: FloatingContext,
	opts: UseRoleOptions = {},
): ElementProps {
	const enabled = $derived(extract(opts.enabled, true));
	const role = $derived(extract(opts.role, "dialog"));
	const ariaRole = $derived(
		(componentRoleToAriaRoleMap.get(role) ?? role) as
			| AriaRole
			| false
			| undefined,
	);
	const parentId = useFloatingParentNodeId();
	const isNested = parentId != null;
	const referenceId = useId();

	const reference: ElementProps["reference"] = $derived.by(() => {
		if (ariaRole === "tooltip" || role === "label") {
			return {
				[`aria-${role === "label" ? "labelledby" : "describedby"}`]:
					context.open ? context.floatingId : undefined,
			};
		}

		return {
			"aria-expanded": context.open ? "true" : "false",
			"aria-haspopup": ariaRole === "alertdialog" ? "dialog" : ariaRole,
			"aria-controls": context.open ? context.floatingId : undefined,
			...(ariaRole === "listbox" && { role: "combobox" }),
			...(ariaRole === "menu" && { id: referenceId }),
			...(ariaRole === "menu" && isNested && { role: "menuitem" }),
			...(role === "select" && { "aria-autocomplete": "none" }),
			...(role === "combobox" && { "aria-autocomplete": "list" }),
		};
	});

	const floating: ElementProps["floating"] = $derived.by(() => {
		const floatingProps = {
			id: context.floatingId,
			...(ariaRole && { role: ariaRole }),
		};

		if (ariaRole === "tooltip" || role === "label") {
			return floatingProps;
		}

		return {
			...floatingProps,
			...(ariaRole === "menu" && {
				"aria-labelledby": referenceId,
			}),
		};
	});

	const item: ElementProps["item"] = $derived.by(() => {
		return ({ active, selected }: ExtendedUserProps) => {
			const commonProps = {
				role: "option",
				...(active && { id: `${context.floatingId}-option` }),
			};

			switch (role) {
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

	return {
		get reference() {
			if (!enabled) return {};
			return reference;
		},
		get item() {
			if (!enabled) return {};
			return item;
		},
		get floating() {
			if (!enabled) return {};
			return floating;
		},
	};
}

export type { UseRoleOptions };
export { useRole };
