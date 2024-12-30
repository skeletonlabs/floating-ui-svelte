<script lang="ts">
import type { Alignment, Side } from "@floating-ui/dom";
import { platform } from "@floating-ui/dom";
import type { FloatingArrowProps } from "../internal/types.js";
import { useId } from "../hooks/useId.js";
import { styleObjectToString } from "../internal/style-object-to-string.js";

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
	// ---
	transform,
	fill,
	// ---
	...rest
}: FloatingArrowProps = $props();

const {
	placement,
	elements: { floating },
	middlewareData: { arrow },
} = $derived(context);

const clipPathId = useId();

// Strokes must be double the border width, this ensures the stroke's width
// works as you'd expect.
const computedStrokeWidth = $derived(strokeWidth * 2);
const halfStrokeWidth = $derived(computedStrokeWidth / 2);

const svgX = $derived((width / 2) * (tipRadius / -8 + 1));
const svgY = $derived(((height / 2) * tipRadius) / 4);

const [side, alignment] = $derived(placement.split("-") as [Side, Alignment]);
const isRTL = $derived(floating && platform.isRTL(floating));
const isCustomShape = $derived(!!d);
const isVerticalSide = $derived(side === "top" || side === "bottom");

const yOffsetProp = $derived(
	staticOffset && alignment === "end" ? "bottom" : "top",
);
const xOffsetProp = $derived.by(() => {
	if (!staticOffset) {
		return "left";
	}
	if (isRTL) {
		return alignment === "end" ? "right" : "left";
	}
	return alignment === "end" ? "right" : "left";
});

const arrowX = $derived(arrow?.x != null ? staticOffset || `${arrow.x}px` : "");
const arrowY = $derived(arrow?.y != null ? staticOffset || `${arrow.y}px` : "");

const dValue = $derived(
	d ||
		`M0,0 H${width} L${width - svgX},${height - svgY} Q${width / 2},${height} ${svgX},${height - svgY} Z`,
);

const rotation = $derived.by(() => {
	switch (side) {
		case "top":
			return isCustomShape ? "rotate(180deg)" : "";
		case "left":
			return isCustomShape ? "rotate(90deg)" : "rotate(-90deg)";
		case "bottom":
			return isCustomShape ? "" : "rotate(180deg)";
		case "right":
			return isCustomShape ? "rotate(-90deg)" : "rotate(90deg)";
	}
});
</script>

<!-- FIXME: extend styleObjectToString type to accept `rest.styles` -->

<svg
        bind:this={ref}
        width={isCustomShape ? width : width + computedStrokeWidth}
        height={width}
        viewBox={`0 0 ${width} ${height > width ? height : width}`}
        aria-hidden="true"
        style={styleObjectToString({
		position: 'absolute',
		'pointer-events': 'none',
		[xOffsetProp]: `${arrowX}`,
		[yOffsetProp]: `${arrowY}`,
		[side]: isVerticalSide || isCustomShape ? '100%' : `calc(100% - ${computedStrokeWidth / 2}px)`,
		transform: `${rotation} ${transform ?? ''}`,
		fill,
	})}
        data-testid="floating-arrow"
        {...rest}
>
    {#if computedStrokeWidth > 0}
        <!-- Account for the stroke on the fill path rendered below. -->
        <path
                fill="none"
                {stroke}
                clip-path={`url(#${clipPathId})`}
                stroke-width={computedStrokeWidth + (d ? 0 : 1)}
                d={dValue}
        />
    {/if}
    <!--
        In Firefox, for left/right placements there's a ~0.5px gap where the
        border can show through. Adding a stroke on the fill removes it.
    -->
    <path stroke={computedStrokeWidth && !d ? fill : 'none'} d={dValue} />
    <!-- Assumes the border-width of the floating element matches the stroke. -->
    <clipPath id={clipPathId}>
        <rect
                x={-halfStrokeWidth}
                y={halfStrokeWidth * (isCustomShape ? -1 : 1)}
                width={width + computedStrokeWidth}
                height={width}
        />
    </clipPath>
</svg>