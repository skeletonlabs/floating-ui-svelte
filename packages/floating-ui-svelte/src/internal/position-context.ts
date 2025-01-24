import type { PositionState } from "../hooks/use-position.svelte.js";
import { Context } from "./context.js";

/**
 * @internal
 */
const PositionContext = new Context<PositionState>("PositionContext");

export { PositionContext };
