import type { Snippet } from "svelte";
import type { useInteractions } from "../../../../src/index.js";
import { Context } from "../../../../src/internal/context.js";

export type MenuContextType = {
	getItemProps: ReturnType<typeof useInteractions>["getItemProps"];
	activeIndex: number | null;
	setHasFocusInside: (curr: boolean) => void;
	allowHover: boolean;
	open: boolean;
	parent: MenuContextType | null;
};

export const MenuContext = new Context<MenuContextType>("MenuContext");
