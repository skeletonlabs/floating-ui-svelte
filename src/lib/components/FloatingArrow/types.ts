export interface FloatingArrowProps {
	/** The binded HTML element reference. */
	ref: any;
	// Context Source: https://github.com/floating-ui/floating-ui/blob/master/packages/react/src/types.ts#L132
	/** The floating context. */
	context: any; // Omit<FloatingContext, 'refs'> & { refs: any };

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
	/** Forces a static offset over dynamic positioning under a certain condition. */
	staticOffset?: string | number | null;
	/** Custom path string. */
	d?: string;
	/** Stroke (border) color of the arrow. */
	stroke?: string;
	/** Stroke (border) width of the arrow. */
	strokeWidth?: number;

	transform?: string;
	fill?: string;
	/** Provide arbitrary classes to the root SVG element. */
	classes?: string;
	/** Provide arbitrary styles to the root SVG element. */
	styles?: string;
}
