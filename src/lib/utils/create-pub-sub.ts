/**
 * A function that creates a simple publish/subscribe mechanism.
 */
export function createPubSub() {
	const map = new Map<string, Array<(data: unknown) => void>>();

	return {
		emit(event: string, data: unknown) {
			map.get(event)?.forEach((handler) => handler(data));
		},
		on(event: string, listener: (data: unknown) => void) {
			map.set(event, [...(map.get(event) || []), listener]);
		},
		off(event: string, listener: (data: unknown) => void) {
			map.set(event, map.get(event)?.filter((l) => l !== listener) || []);
		},
	};
}
