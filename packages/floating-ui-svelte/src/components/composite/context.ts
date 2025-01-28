import { Context } from "../../internal/context.js";

const CompositeContext = new Context<{
	activeIndex: number;
	onNavigate: (index: number) => void;
}>("CompositeContext");

export { CompositeContext };
