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

export interface UseFloatingOptions<T extends ReferenceElement = ReferenceElement> {
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
	readonly elements?: {
		/**
		 * The reference element.
		 */
		readonly reference?: T | null;

		/**
		 * The floating element which is anchored to the reference element.
		 */
		readonly floating?: FloatingElement | null;
	};

	/**
	 * Callback to handle mounting/unmounting of the elements.
	 * @default undefined
	 */
	readonly whileElementsMounted?: (
		reference: T,
		floating: FloatingElement,
		update: () => void
	) => () => void;
}

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

export interface FloatingContext<T extends ReferenceElement = ReferenceElement> {
	/**
	 * Represents the open/close state of the floating element.
	 */
	readonly open: boolean;

	/**
	 * Event handler that can be invoked whenever the open state changes.
	 */
	readonly onOpenChange: (open: boolean, event?: Event, reason?: OpenChangeReason) => void;

	/**
	 * The reference and floating elements.
	 */
	readonly elements: {
		/**
		 * The reference element.
		 */
		readonly reference?: T | null;

		/**
		 * The floating element which is anchored to the reference element.
		 */
		readonly floating?: FloatingElement | null;
	};
}

export interface UseFloatingReturn<T extends ReferenceElement = ReferenceElement> {
	/**
	 * The x-coord of the floating element.
	 */
	readonly x: number;

	/**
	 * The y-coord of the floating element.
	 */
	readonly y: number;

	/**
	 * The stateful placement, which can be different from the initial `placement` passed as options.
	 */
	readonly placement: Placement;

	/**
	 * The type of CSS position property to use.
	 */
	readonly strategy: Strategy;

	/**
	 * Additional data from middleware.
	 */
	readonly middlewareData: MiddlewareData;

	/**
	 * The boolean that let you know if the floating element has been positioned.
	 */
	readonly isPositioned: boolean;

	/**
	 * CSS styles to apply to the floating element to position it.
	 */
	readonly floatingStyles: string;

	/**
	 * The function to update floating position manually.
	 */
	readonly update: () => void;

	/**
	 * Context object containing internal logic to alter the behavior of the floating element.
	 * Commonly used to inject into others hooks.
	 */
	readonly context: FloatingContext<T>;
}
