import type { useInteractions } from "../../../../src/index.js";
import { Context } from "../../../../src/internal/context.js";

interface SelectContextValue {
	activeIndex: number | null;
	selectedIndex: number | null;
	getItemProps: ReturnType<typeof useInteractions>["getItemProps"];
	handleSelect: (index: number | null) => void;
}

export const SelectContext = new Context<SelectContextValue>("SelectContext");
