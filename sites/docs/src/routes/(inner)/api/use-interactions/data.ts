// Hook: useInteractions

import type { TableData } from "$lib/types.js";

// Returns
export const tableReturns: TableData[] = [
	{
		property: "getReferenceProps",
		description: "The merged attributes for the reference element.",
		type: "(userProps?: HTMLAttributes) => Record<string, unknown>",
	},
	{
		property: "getFloatingProps",
		description: "The merged attributes for the floating element.",
		type: "(userProps?: HTMLAttributes) => Record<string, unknown>",
	},
	{
		property: "getItemProps",
		description:
			"The merged attributes for when dealing with a list inside the floating element.",
		type: "(userProps?: HTMLAttributes & ExtendedUserProps) => Record<string, unknown>",
	},
];
