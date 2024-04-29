import type { FloatingElement, ReferenceElement } from '@floating-ui/dom';

export type OpenChangeReason =
	| 'outside-press'
	| 'escape-key'
	| 'ancestor-scroll'
	| 'reference-press'
	| 'click'
	| 'hover'
	| 'focus'
	| 'list-navigation'
	| 'safe-polygon';

export type FloatingElements = {
	/**
	 * The reference element.
	 */
	readonly reference?: ReferenceElement | null;

	/**
	 * The floating element which is anchored to the reference element.
	 */
	readonly floating?: FloatingElement | null;
};
