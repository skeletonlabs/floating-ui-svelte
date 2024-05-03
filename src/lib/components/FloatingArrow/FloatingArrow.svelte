<!--
	@component Renders a customizable `<svg>` pointing arrow triangle inside the floating element that gets automatically positioned.
	@link https://floating-ui.com/docs/FloatingArrow 
-->

<script lang="ts">
	import { platform, type Alignment, type Side } from '@floating-ui/dom';
	import { styleParser } from '$lib/utils.js';
	import type { FloatingArrowProps } from './types.js';

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
		classes,
		styles
	}: FloatingArrowProps = $props();

	// TODO: migrate to useId();
	const clipPathId = 'abc123';

	// Strokes must be double the border width, this ensures the stroke's width
	// works as you'd expect.
	const computedStrokeWidth = strokeWidth * 2;
	const halfStrokeWidth = computedStrokeWidth / 2;

	const svgX = (width / 2) * (tipRadius / -8 + 1);
	const svgY = ((height / 2) * tipRadius) / 4;

	const [side, alignment] = context.placement.split('-') as [Side, Alignment];
	const isRTL = context.elements.floating ? platform.isRTL(context.elements.floating) : false;
	const isCustomShape = !!d;
	const isVerticalSide = side === 'top' || side === 'bottom';

	let yOffsetProp = $state(staticOffset && alignment === 'end' ? 'bottom' : 'top');
	let xOffsetProp = $state(staticOffset && alignment === 'end' ? 'right' : 'left');

	$effect(() => {
		if (staticOffset && isRTL) xOffsetProp = alignment === 'end' ? 'left' : 'right';
	});

	const arrowX =
		context.middlewareData.arrow?.x != null ? staticOffset || context.middlewareData.arrow.x : '';
	const arrowY =
		context.middlewareData.arrow?.y != null ? staticOffset || context.middlewareData.arrow.y : '';

	const dValue =
		d ||
		'M0,0' +
			` H${width}` +
			` L${width - svgX},${height - svgY}` +
			` Q${width / 2},${height} ${svgX},${height - svgY}` +
			' Z';

	const rotation = {
		top: isCustomShape ? 'rotate(180deg)' : '',
		left: isCustomShape ? 'rotate(90deg)' : 'rotate(-90deg)',
		bottom: isCustomShape ? '' : 'rotate(180deg)',
		right: isCustomShape ? 'rotate(-90deg)' : 'rotate(90deg)'
	}[side];
</script>

<svg
	bind:this={ref}
	width={isCustomShape ? width : width + computedStrokeWidth}
	height={width}
	viewBox={`0 0 ${width} ${height > width ? height : width}`}
	aria-hidden
	class={classes}
	style={styleParser({
		position: 'absolute',
		pointerEvents: 'none',
		[xOffsetProp]: arrowX,
		[yOffsetProp]: arrowY,
		[side]: isVerticalSide || isCustomShape ? '100%' : `calc(100% - ${computedStrokeWidth / 2}px)`,
		transform: `${rotation} ${transform ?? ''}`,
		styles
	})}
>
	{#if computedStrokeWidth > 0}
		<!-- Account for the stroke on the fill path rendered below. -->
		<path
			fill="none"
			{stroke}
			style:clipPath={`url(#${clipPathId})`}
			style:strokeWidth={computedStrokeWidth + (d ? 0 : 1)}
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
