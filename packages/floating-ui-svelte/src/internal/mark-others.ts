import { getDocument } from "./dom.js";
import { getNodeName } from "@floating-ui/utils/dom";

type Undo = () => void;

let counterMap = new WeakMap<Element, number>();
let uncontrolledElementsSet = new WeakSet<Element>();
let markerMap: Record<string, WeakMap<Element, number>> = {};
let lockCount = 0;

export function supportsInert(): boolean {
	return typeof HTMLElement !== "undefined" && "inert" in HTMLElement.prototype;
}

function unwrapHost(node: Element | ShadowRoot): Element | null {
	return (
		node &&
		((node as ShadowRoot).host || unwrapHost(node.parentNode as Element))
	);
}

function correctElements(parent: HTMLElement, targets: Element[]): Element[] {
	return targets
		.map((target) => {
			if (parent.contains(target)) return target;
			const correctedTarget = unwrapHost(target);
			if (parent.contains(correctedTarget)) return correctedTarget;
			return null;
		})
		.filter((x): x is Element => x != null);
}

function applyAttributeToOthers(
	uncorrectedAvoidElements: Element[],
	body: HTMLElement,
	ariaHidden: boolean,
	inert: boolean,
): Undo {
	const markerName = "data-floating-ui-inert";
	const controlAttribute = inert ? "inert" : ariaHidden ? "aria-hidden" : null;
	const avoidElements = correctElements(body, uncorrectedAvoidElements);
	const elementsToKeep = new Set<Node>();
	const elementsToStop = new Set<Node>(avoidElements);
	const hiddenElements: Element[] = [];

	if (!markerMap[markerName]) {
		markerMap[markerName] = new WeakMap();
	}

	const markerCounter = markerMap[markerName];

	avoidElements.forEach(keep);
	deep(body);
	elementsToKeep.clear();

	function keep(el: Node | undefined) {
		if (!el || elementsToKeep.has(el)) return;

		elementsToKeep.add(el);
		el.parentNode && keep(el.parentNode);
	}

	function deep(parent: Element | null) {
		if (!parent || elementsToStop.has(parent)) return;

		[].forEach.call(parent.children, (node: Element) => {
			if (getNodeName(node) === "script") return;

			if (elementsToKeep.has(node)) {
				deep(node);
			} else {
				const attr = controlAttribute
					? node.getAttribute(controlAttribute)
					: null;
				const alreadyHidden = attr !== null && attr !== "false";
				const currentCounterValue = counterMap.get(node) || 0;
				const counterValue = controlAttribute
					? currentCounterValue + 1
					: currentCounterValue;
				const markerValue = (markerCounter.get(node) || 0) + 1;

				counterMap.set(node, counterValue);
				markerCounter.set(node, markerValue);
				hiddenElements.push(node);

				if (counterValue === 1 && alreadyHidden) {
					uncontrolledElementsSet.add(node);
				}

				if (markerValue === 1) {
					node.setAttribute(markerName, "");
				}

				if (!alreadyHidden && controlAttribute) {
					node.setAttribute(controlAttribute, "true");
				}
			}
		});
	}

	lockCount++;

	return () => {
		for (const element of hiddenElements) {
			const currentCounterValue = counterMap.get(element) || 0;
			const counterValue = controlAttribute
				? currentCounterValue - 1
				: currentCounterValue;
			const markerValue = (markerCounter.get(element) || 0) - 1;

			counterMap.set(element, counterValue);
			markerCounter.set(element, markerValue);

			if (!counterValue) {
				if (!uncontrolledElementsSet.has(element) && controlAttribute) {
					element.removeAttribute(controlAttribute);
				}

				uncontrolledElementsSet.delete(element);
			}

			if (!markerValue) {
				element.removeAttribute(markerName);
			}
		}

		lockCount--;

		if (!lockCount) {
			counterMap = new WeakMap();
			counterMap = new WeakMap();
			uncontrolledElementsSet = new WeakSet();
			markerMap = {};
		}
	};
}

function markOthers(
	avoidElements: Element[],
	ariaHidden = false,
	inert = false,
): Undo {
	const body = getDocument(avoidElements[0]).body;
	return applyAttributeToOthers(
		avoidElements.concat(Array.from(body.querySelectorAll("[aria-live]"))),
		body,
		ariaHidden,
		inert,
	);
}

export { markOthers };
