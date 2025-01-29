<script lang="ts" module>
	import type { SVGAttributes } from "svelte/elements";
	import type { FloatingContext } from "../hooks/use-floating.svelte.js";

	interface FloatingArrowProps extends SVGAttributes<SVGElement> {
		/** The bound HTML element reference. */
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
	}

	export type { FloatingArrowProps };
</script>

<script lang="ts">
	import type { Alignment, Side } from "@floating-ui/dom";
	import { useId } from "../hooks/use-id.js";
	import {
		styleObjectToString,
		styleStringToObject,
	} from "../internal/style-object-to-string.js";

	let {
		ref = $bindable(null),
		context,
		// ---
		width = 14,
		height = 7,
		tipRadius = 0,
		strokeWidth = 0,
		staticOffset,
		stroke,
		d,
		style: styleProp = "",
		...rest
	}: FloatingArrowProps = $props();

	const { transform, ...restStyle } = $derived(
		styleStringToObject(styleProp)
	);

	const clipPathId = useId();

	let isRTL = $state(false);

	// https://github.com/floating-ui/floating-ui/issues/2932

	$effect(() => {
		if (!context.floating) return;
		if (getComputedStyle(context.floating).direction === "rtl") {
			isRTL = true;
		}
	});

	const [side, alignment] = $derived(
		context.placement.split("-") as [Side, Alignment]
	);
	const isVerticalSide = $derived(side === "top" || side === "bottom");

	const computedStaticOffset = $derived.by(() => {
		if (
			(isVerticalSide && context.middlewareData.shift?.x) ||
			(!isVerticalSide && context.middlewareData.shift?.y)
		) {
			return null;
		}
		return staticOffset;
	});

	// Strokes must be double the border width, this ensures the stroke's width
	// works as you'd expect.
	const computedStrokeWidth = $derived(strokeWidth * 2);
	const halfStrokeWidth = $derived(computedStrokeWidth / 2);

	const svgX = $derived((width / 2) * (tipRadius / -8 + 1));
	const svgY = $derived(((height / 2) * tipRadius) / 4);

	const isCustomShape = $derived(!!d);

	const yOffsetProp = $derived(
		computedStaticOffset && alignment === "end" ? "bottom" : "top"
	);
	const xOffsetProp = $derived.by(() => {
		if (computedStaticOffset && isRTL) {
			return alignment === "end" ? "left" : "right";
		}
		return alignment === "end" ? "right" : "left";
	});

	const arrowX = $derived(
		context.middlewareData.arrow?.x != null
			? staticOffset || `${context.middlewareData.arrow.x}px`
			: ""
	);
	const arrowY = $derived(
		context.middlewareData.arrow?.y != null
			? staticOffset || `${context.middlewareData.arrow.y}px`
			: ""
	);

	const dValue = $derived(
		d ||
			`M0,0 H${width} L${width - svgX},${height - svgY} Q${width / 2},${height} ${svgX},${height - svgY} Z`
	);

	const rotation = $derived.by(() => {
		return {
			top: isCustomShape ? "rotate(180deg)" : "",
			left: isCustomShape ? "rotate(90deg)" : "rotate(-90deg)",
			bottom: isCustomShape ? "" : "rotate(180deg)",
			right: isCustomShape ? "rotate(-90deg)" : "rotate(90deg)",
		}[side];
	});
</script>

{#if context.floating}
	<svg
		bind:this={ref}
		{...rest}
		width={isCustomShape ? width : width + computedStrokeWidth}
		height={width}
		viewBox={`0 0 ${width} ${height > width ? height : width}`}
		aria-hidden="true"
		style={styleObjectToString({
			position: "absolute",
			"pointer-events": "none",
			[xOffsetProp]: `${arrowX}`,
			[yOffsetProp]: `${arrowY}`,
			[side]:
				isVerticalSide || isCustomShape
					? "100%"
					: `calc(100% - ${computedStrokeWidth / 2}px)`,
			transform: [rotation, transform].filter((t) => !!t).join(" "),
			...restStyle,
		})}
		data-testid="floating-arrow">
		{#if computedStrokeWidth > 0}
			<!-- Account for the stroke on the fill path rendered below. -->
			<path
				clip-path={`url(#${clipPathId})`}
				fill="none"
				{stroke}
				stroke-width={computedStrokeWidth + (d ? 0 : 1)}
				d={dValue} />
		{/if}
		<!--
        In Firefox, for left/right placements there's a ~0.5px gap where the
        border can show through. Adding a stroke on the fill removes it.
    -->
		<path
			stroke={computedStrokeWidth && !d ? rest.fill : "none"}
			d={dValue} />
		<!-- Assumes the border-width of the floating element matches the stroke. -->
		<clipPath id={clipPathId}>
			<rect
				x={-halfStrokeWidth}
				y={halfStrokeWidth * (isCustomShape ? -1 : 1)}
				width={width + computedStrokeWidth}
				height={width} />
		</clipPath>
	</svg>
{/if}
