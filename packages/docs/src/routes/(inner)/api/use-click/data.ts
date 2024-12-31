import type { TableData } from "$lib/types.js";

// Options
export const tableOptions: TableData[] = [
	{
		property: "enabled",
		description:
			"Whether the Hook is enabled, including all internal Effects and event handlers.",
		type: "boolean",
		default: "true",
	},
	{
		property: "event",
		description:
			'The type of event to use to determine a "click" with mouse input. Keyboard clicks work as normal.',
		type: '"click" | "mousedown"',
		default: "'click'",
	},
	{
		property: "toggle",
		description: "Whether to toggle the open state with repeated clicks.",
		type: "boolean",
		default: "true",
	},
	{
		property: "ignoreMouse",
		description:
			"Whether to ignore the logic for mouse input (for example, if `useHover()` is also being used). When `useHover()` and `useClick()` are used together, clicking the reference element after hovering it will keep the floating element open even once the cursor leaves. This may not be desirable in some cases.",
		type: "boolean",
		default: "false",
	},
	{
		property: "keyboardHandlers",
		description:
			'Whether to add keyboard handlers (Enter and Space key functionality) for non-button elements (to open/close the floating element via keyboard "click").',
		type: "boolean",
		default: "true",
	},
];
