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
