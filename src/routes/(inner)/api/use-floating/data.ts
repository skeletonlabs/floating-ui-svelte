// Hook: useFloating

import type { TableData } from '$docs/types.js';

// Options
export const tableOptions: TableData[] = [
	{
		property: `open`,
		description: `Represents the open/close state of the floating element.`,
		type: `boolean`,
		default: `true`,
	},
	{
		property: `onOpenChange`,
		description: `Event handler that can be invoked whenever the open state changes.`,
		type: `(open: boolean, event?: Event, reason?: OpenChangeReason) => void`,
		default: ``,
	},
	{
		property: `placement`,
		description: `Where to place the floating element relative to its reference element.`,
		type: `Placement`,
		default: `'bottom'`,
	},
	{
		property: `strategy`,
		description: `The type of CSS position property to use.`,
		type: `Strategy`,
		default: `'absolute'`,
	},
	{
		property: `middleware`,
		description: `Supports all Floating UI middleware`,
		type: `Array<Middleware | undefined | null | false>`,
		default: `undefined`,
	},
	{
		property: `transform`,
		description: `Whether to use transform instead of top and left styles to position the floating element.`,
		type: `boolean`,
		default: `true`,
	},
	{
		property: `elements`,
		description: `The reference and floating elements.`,
		type: `FloatingElements`,
		default: `{}`,
	},
	{
		property: `whileElementsMounted`,
		description: `Callback to handle mounting/unmounting of the elements.`,
		type: `((reference: ReferenceElement, floating: FloatingElement, update: () => void) => () => void) | undefined`,
		default: `undefined`,
	},
	{
		property: 'nodeId',
		description: 'A unique node ID for the floating element when using a `FloatingTree`.',
		type: 'string | undefined',
		default: 'undefined',
	},
];

// Returns
export const tableReturns: TableData[] = [
	{ property: `x`, description: `The x-coord of the floating element.`, type: `number` },
	{ property: `y`, description: `The y-coord of the floating element.`, type: `number` },
	{
		property: `placement`,
		description: `The stateful placement, which can be different from the initial placement passed as options.`,
		type: `Placement`,
	},
	{
		property: `strategy`,
		description: `The stateful strategy, which can be different from the initial strategy passed as options.`,
		type: `Strategy`,
	},
	{
		property: `middlewareData`,
		description: `Additional data from middleware.`,
		type: `MiddlewareData`,
	},
	{
		property: `isPositioned`,
		description: `The boolean that let you know if the floating element has been positioned.`,
		type: `boolean`,
	},
	{
		property: `floatingStyles`,
		description: `CSS styles to apply to the floating element to position it.`,
		type: `string`,
	},
	{
		property: `elements`,
		description: `The reference and floating elements.`,
		type: `FloatingElements`,
	},
	{
		property: `update`,
		description: `The function to update floating position manually.`,
		type: `() => void`,
	},
	{
		property: `context`,
		description: `Context object containing internal logic to alter the behavior of the floating element.`,
		type: `FloatingContext`,
	},
];
