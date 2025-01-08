import type { FloatingElement, ReferenceElement } from "@floating-ui/dom";
import type {
	UsePositionData,
	UsePositionReturn,
} from "./hooks/use-position.svelte.js";

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
	reference?: ReferenceElement | null;

	/**
	 * The floating element.
	 */
	floating?: FloatingElement | null;
}

interface ExtendedElements extends FloatingElements {
	/**
	 * Some hooks require the reference element to be a DOM element,
	 * not a VirtualElement.
	 */
	domReference?: Element | null;
}

interface ContextData {
	/**
	 * The latest even that caused the open state to change.
	 */
	openEvent?: Event;

	floatingContext?: FloatingContext;

	/**
	 * Arbitrary data produced and consumed by other hooks.
	 */
	[key: string]: unknown;
}

interface FloatingContext extends Omit<UsePositionReturn, "elements"> {
	/**
	 * Represents the open/close state of the floating element.
	 */
	open: boolean;

	/**
	 * Callback that is called whenever the open state changes.
	 */
	onOpenChange(open: boolean, event?: Event, reason?: OpenChangeReason): void;

	/**
	 * Events for other hooks to consume.
	 */
	events: FloatingEvents;

	/**
	 * Arbitrary data produced and consumer by other hooks.
	 */
	data: ContextData;

	/**
	 * The id for the reference element
	 */
	nodeId: string | undefined;

	/**
	 * The id for the floating element
	 */
	floatingId: string;

	/**
	 * Object containing the floating and reference elements.
	 */
	elements: ExtendedElements;
}

interface FloatingNodeType {
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
	context?: FloatingContext;
}

interface FloatingTreeType {
	nodes: FloatingNodeType[];
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
	FloatingContext,
	FloatingNodeType,
	FloatingTreeType,
};
