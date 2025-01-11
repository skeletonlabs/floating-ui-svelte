function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
	return typeof value === "function";
}

function isObject(value: unknown): value is Record<PropertyKey, unknown> {
	return value !== null && typeof value === "object";
}

export { isFunction, isObject };
