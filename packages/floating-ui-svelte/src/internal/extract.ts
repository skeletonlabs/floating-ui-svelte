import type { Getter, MaybeGetter } from "../types.js";
import { isFunction } from "./is.js";

/**
 * Extracts the value from a getter or a value.
 * Optionally, a default value can be provided.
 */
function extract<T>(value: MaybeGetter<T>): T;
function extract<T, D extends T>(
	value: MaybeGetter<T>,
	defaultValue: D,
): Exclude<T, undefined>;
function extract<T, D extends T | undefined = undefined>(
	value: MaybeGetter<T>,
	defaultValue?: D,
): D extends undefined ? T : Exclude<T, undefined> {
	if (isFunction(value)) {
		const getter = value as Getter<T>;
		const result = getter();
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		if (result !== undefined) return result as any;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		if (defaultValue !== undefined) return defaultValue as any;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		return result as any;
	}

	if (value === undefined && defaultValue !== undefined) {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		return defaultValue as any;
	}
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	return value as any;
}

export { extract };
