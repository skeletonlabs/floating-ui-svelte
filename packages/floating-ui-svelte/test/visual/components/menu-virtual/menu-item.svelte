<script lang="ts" module>
	interface MenuItemProps {
		label: string;
		disabled?: boolean;
	}
</script>

<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import c from "clsx";
	import type { WithRef } from "../../../../src/types.js";
	import { useListItem } from "../../../../src/components/floating-list/hooks.svelte.js";
	import { useFloatingTree, useId } from "../../../../src/index.js";
	import { box } from "../../../../src/internal/box.svelte.js";
	import {
		MenuContext,
		type MenuContextType,
	} from "../menu/menu-context-provider.svelte";

	let {
		label,
		disabled,
		ref = $bindable(null),
		...rest
	}: WithRef & MenuItemProps & HTMLAttributes<HTMLElement> = $props();

	const menu = MenuContext.get();
	const item = useListItem({ label: () => (disabled ? null : label) });
	const tree = useFloatingTree();
	const isActive = $derived(item.index === menu.activeIndex);
	const id = useId();

	$effect(() => {
		console.log("menu active index", menu.activeIndex);
	});

	const mergedRef = box.with(
		() => ref,
		(v) => {
			item.ref = v;
			ref = v;
		}
	);
</script>

<div
	{...rest}
	{id}
	bind:this={mergedRef.current}
	role="option"
	tabindex={-1}
	aria-selected={isActive}
	aria-disabled={disabled}
	class={c(
		"text-left flex py-1 px-2 focus:bg-red-500 outline-none rounded cursor-default",
		{ "opacity-40": disabled },
		isActive && "bg-red-500 text-white"
	)}
	{...menu.getItemProps({
		onclick(event: MouseEvent & { currentTarget: HTMLElement }) {
			rest.onclick?.(event);
			tree?.events.emit("click");
		},
		onfocus(event: FocusEvent & { currentTarget: HTMLElement }) {
			rest.onfocus?.(event);
			menu.setHasFocusInside(true);
		},
		onmouseenter(event: MouseEvent & { currentTarget: HTMLElement }) {
			rest.onmouseenter?.(event);
			if (menu.allowHover && menu.open) {
				console.log("setting allow hover");
				menu.activeIndex = item.index;
			}
		},
		onkeydown(event: KeyboardEvent & { currentTarget: HTMLElement }) {
			console.log("handling keydown");
			function closeParents(parent: MenuContextType | null) {
				if (!parent) return;
				parent.open = false;
				if (parent?.parent) {
					closeParents(parent.parent);
				}
			}

			if (
				event.key === "ArrowRight" &&
				// If the root reference is in a menubar, close parents
				tree?.nodes[0].context?.domReference?.closest(
					'[role="menubar"]'
				)
			) {
				closeParents(menu.parent);
			}
		},
	})}>
	{label}
</div>
