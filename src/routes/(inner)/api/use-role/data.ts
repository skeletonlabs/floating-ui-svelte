// Hook: useRole

import type { TableData } from '$docs/types.js';

// Options
export const tableOptions: TableData[] = [
	{
		property: `enabled`,
		description: `Enables the interaction.`,
		type: `boolean`,
		default: `true`,
	},
	{
		property: `role`,
		description: `The role that the floating element should be.`,
		type: `AriaRole | ComponentRole`,
		default: `'dialog'`,
	},
];
