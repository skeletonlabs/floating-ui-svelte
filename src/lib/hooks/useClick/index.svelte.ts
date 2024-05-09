import { isMouseLikePointerType, isTypeableElement } from '$lib/utils.js';
import { isHTMLElement } from '@floating-ui/utils/dom';
import type { FloatingContext } from '../useFloating/index.svelte.js';
import type { ElementProps } from '../useInteractions/index.svelte.js';

interface UseClickOptions {
	/**
	 * Whether the Hook is enabled, including all internal Effects and event
	 * handlers.
	 * @default true
	 */
	enabled?: boolean;

	/**
	 * The type of event to use to determine a “click” with mouse input.
	 * Keyboard clicks work as normal.
	 * @default 'click'
	 */
	event?: 'click' | 'mousedown';

	/**
	 * Whether to toggle the open state with repeated clicks.
	 * @default true
	 */
	toggle?: boolean;

	/**
	 * Whether to ignore the logic for mouse input (for example, if `useHover()`
	 * is also being used).
	 * When `useHover()` and `useClick()` are used together, clicking the
	 * reference element after hovering it will keep the floating element open
	 * even once the cursor leaves. This may be not be desirable in some cases.
	 * @default false
	 */
	ignoreMouse?: boolean;

	/**
	 * Whether to add keyboard handlers (Enter and Space key functionality) for
	 * non-button elements (to open/close the floating element via keyboard
	 * “click”).
	 * @default true
	 */
	keyboardHandlers?: boolean;
}

function isButtonTarget(event: KeyboardEvent) {
	return isHTMLElement(event.target) && event.target.tagName === 'BUTTON';
}

function isSpaceIgnored(element: Element | null) {
	return isTypeableElement(element);
}

function useClick(context: FloatingContext, options: UseClickOptions = {}): ElementProps {
	const {
		open,
		onOpenChange,
		data,
		elements: { reference }
	} = $derived(context);

	const {
		enabled = true,
		event: eventOption = 'click',
		toggle = true,
		ignoreMouse = false,
		keyboardHandlers = true
	} = $derived(options);

	let pointerType: PointerEvent['pointerType'] | undefined = undefined;
	let didKeyDown = false;

	const elementProps = $derived.by(() => {
		if (!enabled) {
			return {};
		}

		return {
			reference: {
				onpointerdown: (event: PointerEvent) => {
					pointerType = event.pointerType;
				},
				onmousedown: (event: MouseEvent) => {
					if (event.button !== 0) {
						return;
					}

					if (isMouseLikePointerType(pointerType, true) && ignoreMouse) {
						return;
					}

					if (eventOption === 'click') {
						return;
					}

					if (open && toggle && (data.openEvent ? data.openEvent.type === 'mousedown' : true)) {
						onOpenChange(false, event, 'click');
					} else {
						// Prevent stealing focus from the floating element
						event.preventDefault();
						onOpenChange(true, event, 'click');
					}
				},
				onclick: (event: MouseEvent) => {
					if (eventOption === 'mousedown' && pointerType) {
						pointerType = undefined;
						return;
					}

					if (isMouseLikePointerType(pointerType, true) && ignoreMouse) {
						return;
					}

					if (open && toggle && (data.openEvent ? data.openEvent.type === 'click' : true)) {
						onOpenChange(false, event, 'click');
					} else {
						onOpenChange(true, event, 'click');
					}
				},
				onkeydown: (event: KeyboardEvent) => {
					pointerType = undefined;

					if (event.defaultPrevented || !keyboardHandlers || isButtonTarget(event)) {
						return;
					}

					// @ts-expect-error - Fix types
					if (event.key === ' ' && !isSpaceIgnored(reference)) {
						// Prevent scrolling
						event.preventDefault();
						didKeyDown = true;
					}

					if (event.key === 'Enter') {
						if (open && toggle) {
							onOpenChange(false, event, 'click');
						} else {
							onOpenChange(true, event, 'click');
						}
					}
				},
				onkeyup: (event: KeyboardEvent) => {
					if (
						event.defaultPrevented ||
						!keyboardHandlers ||
						isButtonTarget(event) ||
						// @ts-expect-error - Fix types
						isSpaceIgnored(reference)
					) {
						return;
					}

					if (event.key === ' ' && didKeyDown) {
						didKeyDown = false;
						if (open && toggle) {
							onOpenChange(false, event, 'click');
						} else {
							onOpenChange(true, event, 'click');
						}
					}
				}
			}
		};
	});

	return elementProps;
}

export { useClick, type UseClickOptions };
