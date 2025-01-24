import type { Axis, Length, Side, VirtualElement } from "@floating-ui/dom";
import type { FloatingContext } from "./hooks/use-floating.svelte.js";
import type { PositionState } from "./hooks/use-position.svelte.js";

type OpenChangeReason =
	| "outside-press"
	| "escape-key"
	| "ancestor-scroll"
	| "reference-press"
	| "click"
	| "hover"
	| "focus"
	| "focus-out"
	| "list-navigation"
	| "safe-polygon";

type ReferenceType = Element | VirtualElement;

type NarrowedElement<T> = T extends Element ? T : Element;

type Boxed<T> = { current: T };

type Coords = { [key in Axis]: number };
type Dimensions = { [key in Length]: number };
type Rect = Coords & Dimensions;

interface FloatingEvents {
	// biome-ignore lint/suspicious/noExplicitAny: From the port
	emit<T extends string>(event: T, data?: any): void;
	/**
	 * Listen for events emitted by the floating tree.
	 * Returns a function to remove the listener.
	 */
	// biome-ignore lint/suspicious/noExplicitAny: From the port
	on(event: string, handler: (data: any) => void): () => void;
	// biome-ignore lint/suspicious/noExplicitAny: From the port
	off(event: string, handler: (data: any) => void): void;
}

interface ContextData<RT extends ReferenceType = ReferenceType> {
	/**
	 * The latest even that caused the open state to change.
	 */
	openEvent?: Event;

	floatingContext?: FloatingContext<RT>;

	/** @deprecated use `onTypingChange` prop in `useTypeahead` */
	typing?: boolean;

	/**
	 * Arbitrary data produced and consumed by other hooks.
	 */
	[key: string]: unknown;
}

type OnOpenChange = (
	open: boolean,
	event?: Event,
	reason?: OpenChangeReason,
) => void;

interface FloatingNodeType<RT extends ReferenceType = ReferenceType> {
	/**
	 * The unique id for the node.
	 */
	id: string | undefined;

	/**
	 * The parent id for the node.
	 */
	parentId: string | null;

	/**
	 * An optional context object that can be used to pass data between hooks.
	 */
	context?: FloatingContext<RT>;
}

interface FloatingTreeType<RT extends ReferenceType = ReferenceType> {
	nodes: FloatingNodeType<RT>[];
	events: FloatingEvents;
	addNode(node: FloatingNodeType): void;
	removeNode(node: FloatingNodeType): void;
}

type WhileElementsMounted<RT extends ReferenceType = ReferenceType> = (
	reference: RT,
	floating: HTMLElement,
	update: () => void,
) => () => void;

type Getter<T> = () => T;
type MaybeGetter<T> = T | Getter<T>;

interface WithRef<T extends Element = HTMLElement> {
	/**
	 * A bindable reference to the element.
	 */
	ref: T | null;
}

export type {
	OpenChangeReason,
	FloatingEvents,
	ContextData,
	FloatingNodeType,
	FloatingTreeType,
	ReferenceType,
	NarrowedElement,
	OnOpenChange,
	Getter,
	MaybeGetter,
	WhileElementsMounted,
	WithRef,
	Boxed,
	Rect,
	Coords,
	Dimensions,
	Side,
};
