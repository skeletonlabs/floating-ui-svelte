/**
 * Checks if the pointer type is mouse-like.
 */
export function isMouseLikePointerType(pointerType: string | undefined, strict?: boolean) {
	// On some Linux machines with Chromium, mouse inputs return a `pointerType`
	// of "pen": https://github.com/floating-ui/floating-ui/issues/2015
	const values: Array<string | undefined> = ['mouse', 'pen'];
	if (!strict) {
		values.push('', undefined);
	}
	return values.includes(pointerType);
}
