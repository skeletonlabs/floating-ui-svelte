import { isAndroid } from './is-android.js';
import { isJSDOM } from './is-jsdom.js';

/**
 * Check if the pointer event is a virtual event.
 */
export function isVirtualPointerEvent(event: PointerEvent) {
	if (isJSDOM()) {
		return false;
	}
	return (
		(!isAndroid() && event.width === 0 && event.height === 0) ||
		(isAndroid() &&
			event.width === 1 &&
			event.height === 1 &&
			event.pressure === 0 &&
			event.detail === 0 &&
			event.pointerType === 'mouse') ||
		// iOS VoiceOver returns 0.333• for width/height.
		(event.width < 1 &&
			event.height < 1 &&
			event.pressure === 0 &&
			event.detail === 0 &&
			event.pointerType === 'touch')
	);
}
