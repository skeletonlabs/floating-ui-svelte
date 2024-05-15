// Hook: useFocus

import type { TableData } from '$docs/types.js';

// Options
export const tableOptions: TableData[] = [
	{
		property: `enabled`,
		description: `Whether the Hook is enabled, including all internal Effects and event handlers.`,
		type: `boolean`,
		default: `true`,
	},
	{
		property: `visibleOnly`,
		description: `Whether the open state only changes if the focus event is considered visible (\`:focus-visible\` CSS selector)`,
		type: `boolean`,
		default: `true`,
	},
];
