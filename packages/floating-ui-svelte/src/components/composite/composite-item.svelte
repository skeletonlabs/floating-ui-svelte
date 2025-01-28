<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { Boxed, WithRef } from "../../types.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { CompositeContext } from "./context.js";
	import { useListItem } from "../floating-list/hooks.svelte.js";
	import { box } from "../../internal/box.svelte.js";

	interface CompositeItemProps {
		render?: Snippet<
			[HTMLAttributes<HTMLElement>, Boxed<HTMLElement | null>]
		>;
	}

	export type { CompositeItemProps };
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		render,
		...rest
	}: WithRef & HTMLAttributes<HTMLElement> & CompositeItemProps = $props();

	const ctx = CompositeContext.get();
	const listItem = useListItem();

	$effect(() => {
		console.log("listitem index", listItem.index);
	});

	const isActive = $derived(ctx.activeIndex === listItem.index);

	const mergedProps: HTMLAttributes<HTMLElement> = $derived({
		...rest,
		tabindex: isActive ? 0 : -1,
		"data-active": isActive ? "" : undefined,
		onfocus: (event) => {
			rest.onfocus?.(event);
			ctx.onNavigate(listItem.index);
		},
	});

	const boxedRef = box.with(
		() => ref,
		(v) => {
			ref = v;
			listItem.ref = v;
		}
	);
</script>

{#if render}
	{@render render(mergedProps, boxedRef)}
{:else}
	{@const { children, ...restMerged } = mergedProps}
	<div {...restMerged} bind:this={boxedRef.current}>
		{@render children?.()}
	</div>
{/if}
