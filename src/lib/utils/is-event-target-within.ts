/**
 * Check if an event target is within a given node.
 */
export function isEventTargetWithin(event: Event, node: Node | null | undefined) {
	if (node == null) {
		return false;
	}

	if ('composedPath' in event) {
		return event.composedPath().includes(node);
	}

	// TS thinks `event` is of type never as it assumes all browsers support composedPath, but browsers without shadow dom don't
	const e = event as Event;
	return e.target != null && node.contains(e.target as Node);
}
