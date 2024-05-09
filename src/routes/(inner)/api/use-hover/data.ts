// Hook: useHover

import type { TableData } from '$docs/types.js';

// Options
export const tableOptions: TableData[] = [
	{
		property: `enabled`,
		description: `Enables the hook.`,
		type: `boolean`,
		default: `true`,
	},
	{
		property: `mouseOnly`,
		description: `Only allow pointers of type mouse to trigger the hover (thus excluding pens and touchscreens).`,
		type: `boolean`,
		default: `false`,
	},
	{
		property: `delay`,
		description: `Time in ms that will delay the change of the open state. Also accepts an object with open and close properties for finer grained control.`,
		type: `number`,
		default: `0`,
	},
	{
		property: `restMs`,
		description: `Time in ms that the pointer must rest on the reference element before the open state is set to true.`,
		type: `number`,
		default: `0`,
	},
	{
		property: `move`,
		description: `Whether moving the pointer over the floating element will open it, without a regular hover event required.`,
		type: `boolean`,
		default: `true`,
	},
	{
		property: `handleClose`,
		description: `Callback to handle the closing of the floating element.`,
		type: `HandleCloseFn`,
		default: `null`,
	},
];
