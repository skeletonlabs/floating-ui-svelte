<script lang="ts">
	import type { Placement } from "@floating-ui/utils";
	import type { ComponentProps, Snippet } from "svelte";
	import FloatingArrow from "../../../../src/components/floating-arrow.svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Middleware } from "@floating-ui/dom";
	import { useFloating } from "../../../../src/index.js";
	import { arrow, autoUpdate, offset } from "@floating-ui/dom";
	import { mergeStyles } from "../../../../src/internal/style-object-to-string.js";
	import type { PropertiesHyphen } from "csstype";

	let {
		placement: placementProp,
		arrowProps,
		middleware,
		floatingProps,
		floatingStyle,
		children,
	}: {
		placement?: Placement;
		arrowProps?: Partial<ComponentProps<typeof FloatingArrow>>;
		floatingStyle?: PropertiesHyphen;
		floatingProps?: HTMLAttributes<HTMLDivElement>;
		middleware?: Array<Middleware>;
		children?: Snippet;
	} = $props();

	let open = $state(true);

	let arrowRef: SVGSVGElement = $state(null!);

	const f = useFloating({
		placement: () => placementProp,
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
		whileElementsMounted: autoUpdate,
		middleware: () => [
			offset(8),
			...(middleware ?? []),
			arrow({ element: arrowRef }),
		],
	});

	const edgeAlignment = $derived(placementProp?.split("-")[1]);
</script>

<div>
	<span
		bind:this={f.reference}
		style="background: royalblue; padding: 5; color: white;">
		{f.placement}
	</span>
	{#if open}
		<div
			bind:this={f.floating}
			class="bg-black text-white p-2 bg-clip-padding"
			{...floatingProps}
			style={mergeStyles(
				{
					visibility: f.middlewareData.hide?.referenceHidden
						? "hidden"
						: "visible",
				},
				f.floatingStyles,
				floatingStyle
			)}>
			{#if children}
				{@render children?.()}
			{:else}
				Tooltip
			{/if}
			<FloatingArrow
				context={f.context}
				bind:ref={arrowRef}
				staticOffset={edgeAlignment ? "15%" : null}
				{...arrowProps} />
		</div>
	{/if}
</div>
