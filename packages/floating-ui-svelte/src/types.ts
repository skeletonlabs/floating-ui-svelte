import type { FloatingElement, VirtualElement } from "@floating-ui/dom";
import type { FloatingContext } from "./hooks/use-floating.svelte.js";

type OpenChangeReason =
	| "outside-press"
	| "escape-key"
	| "ancestor-scroll"
	| "reference-press"
	| "click"
	| "hover"
	| "focus"
	| "list-navigation"
	| "safe-polygon";

type ReferenceType = Element | VirtualElement;

type NarrowedElement<T> = T extends Element ? T : Element;

interface FloatingEvents {
	// biome-ignore lint/suspicious/noExplicitAny: From the port
	emit<T extends string>(event: T, data?: any): void;
	// biome-ignore lint/suspicious/noExplicitAny: From the port
	on(event: string, handler: (data: any) => void): void;
	// biome-ignore lint/suspicious/noExplicitAny: From the port
	off(event: string, handler: (data: any) => void): void;
}

interface FloatingElements {
	/**
	 * The reference element.
	 */
	reference?: ReferenceType | null;

	/**
	 * The floating element.
	 */
	floating?: FloatingElement | null;
}

interface ExtendedElements<RT> extends Required<FloatingElements> {
	/**
	 * Some hooks require the reference element to be a DOM element,
	 * not a VirtualElement.
	 */
	domReference: NarrowedElement<RT> | null;
}

interface ContextData<RT extends ReferenceType = ReferenceType> {
	/**
	 * The latest even that caused the open state to change.
	 */
	openEvent?: Event;

	floatingContext?: FloatingContext<RT>;

	/**
	 * Arbitrary data produced and consumed by other hooks.
	 */
	[key: string]: unknown;
}

// interface FloatingContext<RT extends ReferenceType = ReferenceType>
// 	extends Omit<UsePositionReturn, "elements"> {
// 	/**
// 	 * Represents the open/close state of the floating element.
// 	 */
// 	open: boolean;

// 	/**
// 	 * Callback that is called whenever the open state changes.
// 	 */
// 	onOpenChange(open: boolean, event?: Event, reason?: OpenChangeReason): void;

// 	/**
// 	 * Events for other hooks to consume.
// 	 */
// 	events: FloatingEvents;

// 	/**
// 	 * Arbitrary data produced and consumer by other hooks.
// 	 */
// 	data: ContextData;

// 	/**
// 	 * The id for the reference element
// 	 */
// 	nodeId: string | undefined;

// 	/**
// 	 * The id for the floating element
// 	 */
// 	floatingId: string | undefined;

// 	/**
// 	 * Object containing the floating and reference elements.
// 	 */
// 	elements: ExtendedElements<RT>;
// }

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

export type {
	OpenChangeReason,
	FloatingEvents,
	FloatingElements,
	ContextData,
	ExtendedElements,
	FloatingNodeType,
	FloatingTreeType,
	ReferenceType,
	NarrowedElement,
	OnOpenChange,
};
