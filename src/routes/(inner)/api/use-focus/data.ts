// Hook: useFocus

import type { TableData } from '$docs/types.js';

// Options
export const tableOptions: TableData[] = [
	{
		property: `enabled`,
		description: `Conditionally enable/disable the Hook.`,
		type: `boolean`,
		default: `true`,
	},
	{
		property: `visibleOnly`,
		description: `Whether the open state only changes if the focus event is considered visible (:focus-visible CSS selector).`,
		type: `boolean`,
		default: `true`,
	},
];
