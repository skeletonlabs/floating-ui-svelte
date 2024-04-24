export function unwrap<T>(valueOrGetter: T | (() => T)): T {
	return typeof valueOrGetter === 'function' ? (valueOrGetter as () => T)() : valueOrGetter;
}
