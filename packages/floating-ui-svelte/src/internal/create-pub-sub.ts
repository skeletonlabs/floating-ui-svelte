function createPubSub() {
	const map = new Map<string, Array<(data: unknown) => void>>();
	return {
		emit(event: string, data: unknown) {
			const handlers = map.get(event);
			if (!handlers) {
				return;
			}
			for (const handler of handlers) {
				handler(data);
			}
		},
		on(event: string, listener: (data: unknown) => void) {
			map.set(event, [...(map.get(event) || []), listener]);
		},
		off(event: string, listener: (data: unknown) => void) {
			map.set(event, map.get(event)?.filter((l) => l !== listener) || []);
		},
	};
}

export { createPubSub };
