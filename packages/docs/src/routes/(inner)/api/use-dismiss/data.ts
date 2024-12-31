// Hook: useDismiss

import type { TableData } from '$lib/types.js';

// Options
export const tableOptions: TableData[] = [
	{
		property: `enabled`,
		description: `Whether the Hook is enabled, including all internal Effects and event handlers.`,
		type: `boolean`,
		default: `true`,
	},
	{
		property: `escapeKey`,
		description: `Whether to dismiss the floating element upon pressing the \`esc\` key.`,
		type: `boolean`,
		default: `true`,
	},
	{
		property: `referencePress`,
		description: `Whether to dismiss the floating element upon pressing the reference element. You likely want to ensure the \`move\` option in the \`useHover()\` Hook has been disabled when this is in use.`,
		type: `boolean`,
		default: `false`,
	},
	{
		property: `referencePressEvent`,
		description: `The type of event to use to determine a “press”.`,
		type: `'pointerdown' | 'mousedown' | 'click'`,
		default: `'pointerdown'`,
	},
	{
		property: `outsidePress`,
		description: `Whether to dismiss the floating element upon pressing outside of the floating element.`,
		type: `boolean | ((event: MouseEvent) => boolean)`,
		default: `true`,
	},
	{
		property: `outsidePressEvent`,
		description: `The type of event to use to determine an outside “press”.`,
		type: `'pointerdown' | 'mousedown' | 'click'`,
		default: `'pointerdown'`,
	},
	{
		property: `ancestorScroll`,
		description: `Whether to dismiss the floating element upon scrolling an overflow ancestor.`,
		type: `boolean`,
		default: `false`,
	},
	{
		property: `bubbles`,
		description: `Determines whether event listeners bubble upwards through a tree of floating elements.`,
		type: `boolean | { escapeKey?: boolean; outsidePress?: boolean }`,
		default: `undefined`,
	},
	{
		property: `capture`,
		description: `Determines whether to use capture phase event listeners.`,
		type: `boolean | { escapeKey?: boolean; outsidePress?: boolean }`,
		default: `undefined`,
	},
];
