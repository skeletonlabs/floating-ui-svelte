import type { useInteractions } from "../../../../src/index.js";
import { Context } from "../../../../src/internal/context.js";

interface SelectContextValue {
	activeIndex: number | null;
	getItemProps: ReturnType<typeof useInteractions>["getItemProps"];
}

const SelectContext = new Context<SelectContextValue>("SelectContext");

export { SelectContext };
export type { SelectContextValue };
