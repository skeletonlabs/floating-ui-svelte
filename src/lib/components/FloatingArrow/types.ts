import type { FloatingContext } from '$lib/hooks/useFloating/index.svelte.js';
import type { SVGAttributes } from 'svelte/elements';

export interface FloatingArrowProps extends SVGAttributes<SVGElement> {
	/** The binded HTML element reference. */
	ref: Element | null;
	/** The floating context. */
	context: FloatingContext;
	/**
	 * Width of the arrow.
	 * @default 14
	 */
	width?: number;
	/**
	 * Height of the arrow.
	 * @default 7
	 */
	height?: number;
	/**
	 * The corner radius (rounding) of the arrow tip.
	 * @default 0 (sharp)
	 */
	tipRadius?: number;
	/**
	 * Forces a static offset over dynamic positioning under a certain condition.
	 * @default undefined (use dynamic position)
	 */
	staticOffset?: string | number | null;
	/**
	 * Custom path string.
	 * @default undefined (use dynamic path)
	 */
	d?: string;
	/**
	 * Stroke (border) color of the arrow.
	 * @default "none"
	 */
	stroke?: string;
	/**
	 * Stroke (border) width of the arrow.
	 * @default 0
	 */
	strokeWidth?: number;

	// Styling ---
	/** Set transform styles. */
	transform?: string;
	/** Set fill styles. */
	fill?: string;
}
