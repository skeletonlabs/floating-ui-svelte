<script lang="ts">
	import type { HTMLButtonAttributes } from "svelte/elements";
	import {
		MenuContext,
		type MenuContextType,
	} from "./menu-context-provider.svelte";
	import { useListItem } from "../../../../src/components/floating-list/hooks.svelte.js";
	import { useFloatingTree } from "../../../../src/index.js";
	import c from "clsx";

	interface MenuItemProps {
		label: string;
		disabled?: boolean;
	}

	let {
		label,
		disabled,
		class: className,
		...rest
	}: MenuItemProps & HTMLButtonAttributes = $props();

	const menu = MenuContext.get();
	const item = useListItem({ label: () => (disabled ? null : label) });
	const tree = useFloatingTree();
	const isActive = $derived(item.index === menu.activeIndex);

	type ButtonEvent<T> = T & { currentTarget: HTMLButtonElement };
</script>

<button
	{...rest}
	bind:this={item.ref}
	type="button"
	role="menuitem"
	{disabled}
	tabindex={isActive ? 0 : -1}
	class={c(
		"text-left flex py-1 px-2 focus:bg-blue-500 focus:text-white outline-none rounded",
		{ "opacity-40": disabled },
		className
	)}
	{...menu.getItemProps({
		active: isActive,
		onclick: (event: ButtonEvent<MouseEvent>) => {
			rest.onclick?.(event);
			tree?.events.emit("click");
		},
		onfocus: (event: ButtonEvent<FocusEvent>) => {
			rest.onfocus?.(event);
			menu.setHasFocusInside(true);
		},
		onmouseenter: (event: ButtonEvent<MouseEvent>) => {
			rest.onmouseenter?.(event);
			if (menu.allowHover && menu.open) {
				menu.activeIndex = item.index;
			}
		},
		onkeydown: (event: ButtonEvent<KeyboardEvent>) => {
			function closeParents(parent: MenuContextType | null) {
				if (parent) {
					parent.open = false;
				}
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
</button>
