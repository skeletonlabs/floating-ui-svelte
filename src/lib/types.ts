import type { ReadableBox } from '$lib/box.svelte.js';
import type {
	FloatingElement,
	Middleware,
	MiddlewareData,
	Placement,
	ReferenceElement,
	Strategy
} from '@floating-ui/dom';

export type Getter<T> = () => T;

export type Expand<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

export type UseFloatingOptions<T extends ReferenceElement = ReferenceElement> = {
	/**
	 * Represents the open/close state of the floating element.
	 * @default true
	 */
	open?: boolean;

	/**
	 * TODO: Document this.
	 */
	onOpenChange?: (open: boolean, event?: Event, reason?: OpenChangeReason) => void;

	/**
	 * Where to place the floating element relative to its reference element.
	 * @default 'bottom'
	 */
	placement?: Placement;

	/**
	 * The type of CSS position property to use.
	 * @default 'absolute'
	 */
	strategy?: Strategy;

	/**
	 * These are plain objects that modify the positioning coordinates in some fashion, or provide useful data for the consumer to use.
	 * @default undefined
	 */
	middleware?: Array<Middleware | undefined | null | false>;

	/**
	 * Whether to use `transform` instead of `top` and `left` styles to
	 * position the floating element (`floatingStyles`).
	 * @default true
	 */
	transform?: boolean;

	/**
	 * TODO: Document this.
	 */
	elements?: {
		reference?: T | null;
		floating?: FloatingElement | null;
	};

	/**
	 * Callback to handle mounting/unmounting of the elements.
	 * @default undefined
	 */
	whileElementsMounted?: (
		reference: T,
		floating: FloatingElement,
		update: () => void
	) => () => void;
};

type OpenChangeReason =
	| 'outside-press'
	| 'escape-key'
	| 'ancestor-scroll'
	| 'reference-press'
	| 'click'
	| 'hover'
	| 'focus'
	| 'list-navigation'
	| 'safe-polygon';

export type UseFloatingReturn = {
	/**
	 * The x-coord of the floating element.
	 */
	x: ReadableBox<number>;

	/**
	 * The y-coord of the floating element.
	 */
	y: ReadableBox<number>;

	/**
	 * The stateful placement, which can be different from the initial `placement` passed as options.
	 */
	placement: ReadableBox<Placement>;

	/**
	 * The type of CSS position property to use.
	 */
	strategy: ReadableBox<Strategy>;

	/**
	 * Additional data from middleware.
	 */
	middlewareData: ReadableBox<MiddlewareData>;

	/**
	 * The boolean that let you know if the floating element has been positioned.
	 */
	isPositioned: ReadableBox<boolean>;

	/**
	 * CSS styles to apply to the floating element to position it.
	 */
	floatingStyles: ReadableBox<string>;

	/**
	 * The function to update floating position manually.
	 */
	update: () => void;
};
