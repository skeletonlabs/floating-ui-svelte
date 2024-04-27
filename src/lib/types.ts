import type {
	FloatingElement,
	Middleware,
	Placement,
	ReferenceElement,
	Strategy
} from '@floating-ui/dom';

export type Expand<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

export interface UseFloatingOptions {
	/**
	 * Represents the open/close state of the floating element.
	 * @default true
	 */
	readonly open?: boolean;

	/**
	 * Event handler that can be invoked whenever the open state changes.
	 */
	readonly onOpenChange?: (open: boolean, event?: Event, reason?: OpenChangeReason) => void;

	/**
	 * Where to place the floating element relative to its reference element.
	 * @default 'bottom'
	 */
	readonly placement?: Placement;

	/**
	 * The type of CSS position property to use.
	 * @default 'absolute'
	 */
	readonly strategy?: Strategy;

	/**
	 * These are plain objects that modify the positioning coordinates in some fashion, or provide useful data for the consumer to use.
	 * @default undefined
	 */
	readonly middleware?: Array<Middleware | undefined | null | false>;

	/**
	 * Whether to use `transform` instead of `top` and `left` styles to
	 * position the floating element (`floatingStyles`).
	 * @default true
	 */
	readonly transform?: boolean;

	/**
	 * The reference and floating elements.
	 */
	readonly elements?: FloatingElements;

	/**
	 * Callback to handle mounting/unmounting of the elements.
	 * @default undefined
	 */
	readonly whileElementsMounted?: (
		reference: ReferenceElement,
		floating: FloatingElement,
		update: () => void
	) => () => void;
}

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
