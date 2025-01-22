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

			return () => {
				map.set(event, map.get(event)?.filter((l) => l !== listener) || []);
			};
		},
		// biome-ignore lint/suspicious/noExplicitAny: TODO: Type this with the actual structures maybe not since people could make their own custom ones? Idk we'll see
		off(event: string, listener: (data: any) => void) {
			map.set(event, map.get(event)?.filter((l) => l !== listener) || []);
		},
	};
}

export { createPubSub };
