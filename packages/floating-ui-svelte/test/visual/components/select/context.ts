import type { useInteractions } from "../../../../src/index.js";
import { Context } from "../../../../src/internal/context.js";

export interface SelectContextData {
	getItemProps: ReturnType<typeof useInteractions>["getItemProps"];
	activeIndex: number | null;
	selectedIndex: number | null;
	isTyping: boolean;
	setSelectedValue: (value: string, index: number) => void;
	selectedValue: string;
}

export const SelectContext = new Context<SelectContextData>("SelectContext");
