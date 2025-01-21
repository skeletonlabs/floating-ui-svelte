function createPubSub() {
	const map = new Map<string, Array<(data: unknown) => void>>();
	return {
		// biome-ignore lint/suspicious/noExplicitAny: TODO: Type this with the actual structures?
		emit(event: string, data: any) {
			const handlers = map.get(event);
			if (!handlers) {
				return;
			}
			for (const handler of handlers) {
				handler(data);
			}
		},
		// biome-ignore lint/suspicious/noExplicitAny: TODO: Type this with the actual structures?
		on(event: string, listener: (data: any) => void) {
			map.set(event, [...(map.get(event) || []), listener]);
		},
		// biome-ignore lint/suspicious/noExplicitAny: TODO: Type this with the actual structures?
		off(event: string, listener: (data: any) => void) {
			map.set(event, map.get(event)?.filter((l) => l !== listener) || []);
		},
	};
}

export { createPubSub };
