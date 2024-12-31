// Component: FloatingArrow

import type { TableData } from '$lib/types.js';

// Props
export const tableProps: TableData[] = [
	{
		property: `ref*`,
		description: `Bound element reference.`,
		type: `HTMLElement | null`,
		default: `-`,
	},
	{
		property: `context*`,
		description: `The context object returned from useFloating().`,
		type: `FloatingContext`,
		default: `-`,
	},
	{
		property: `width`,
		description: `The width of the arrow.`,
		type: `number`,
		default: `14`,
	},
	{
		property: `height`,
		description: `The height of the arrow.`,
		type: `number`,
		default: `7`,
	},
	{
		property: `tipRadius`,
		description: `The radius (rounding) of the arrow tip.`,
		type: `number`,
		default: `0 (sharp)`,
	},
	{
		property: `staticOffset`,
		description: `A static offset override of the arrow from the floating element edge. Often desirable if the floating element is smaller than the reference element along the relevant axis and has an edge alignment (start/end).`,
		type: `string | number | null`,
		default: `undefined (use dynamic path)`,
	},
	{
		property: `d`,
		description: `A custom path for the arrow. Useful if you want fancy rounding. The path should be inside a square SVG and placed at the bottom of it. The path is designed for the 'bottom' placement, which will be rotated for other placements.`,
		type: `string`,
		default: `"black" (browser default)`,
	},
	{
		property: `fill`,
		description: `The color of the arrow.`,
		type: `string`,
		default: `xxx`,
	},
	{
		property: `stroke`,
		description: `The stroke (border) color of the arrow. This must match (or be less than) the floating element’s border width.`,
		type: `string`,
		default: `"none"`,
	},
	{
		property: `strokeWidth`,
		description: `The stroke (border) width of the arrow.`,
		type: `number`,
		default: `0`,
	},
];
