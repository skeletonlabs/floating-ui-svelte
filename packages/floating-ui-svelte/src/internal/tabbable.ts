import { activeElement, contains, getDocument } from "./dom.js";
import { tabbable } from "tabbable";

function getTabbableOptions() {
	return {
		getShadowRoot: true,
		displayCheck:
			// JSDOM does not support the `tabbable` library. To solve this we can
			// check if `ResizeObserver` is a real function (not polyfilled), which
			// determines if the current environment is JSDOM-like.
			typeof ResizeObserver === "function" &&
			ResizeObserver.toString().includes("[native code]")
				? "full"
				: "none",
	} as const;
}

function getTabbableIn(container: HTMLElement, direction: "next" | "prev") {
	const allTabbable = tabbable(container, getTabbableOptions());

	if (direction === "prev") {
		allTabbable.reverse();
	}

	const activeEl = activeElement(getDocument(container)) as HTMLElement;
	console.log(allTabbable);
	console.log(activeEl);

	const activeIndex = allTabbable.indexOf(activeEl);
	const nextTabbableElements = allTabbable.slice(activeIndex + 1);
	return nextTabbableElements[0];
}

function getNextTabbable() {
	return getTabbableIn(document.body, "next");
}

function getPreviousTabbable() {
	return getTabbableIn(document.body, "prev");
}

function isOutsideEvent(event: FocusEvent, container?: Element | null) {
	const containerElement = container || (event.currentTarget as Element);
	const relatedTarget = event.relatedTarget as HTMLElement | null;
	return !relatedTarget || !contains(containerElement, relatedTarget);
}

function disableFocusInside(container: HTMLElement) {
	const tabbableElements = tabbable(container, getTabbableOptions());
	for (const element of tabbableElements) {
		element.dataset.tabindex = element.getAttribute("tabindex") || "";
		element.setAttribute("tabindex", "-1");
	}
}

function enableFocusInside(container: HTMLElement) {
	const elements = Array.from(
		container.querySelectorAll<HTMLElement>("[data-tabindex]"),
	);
	for (const element of elements) {
		const tabindex = element.dataset.tabindex;
		delete element.dataset.tabindex;
		if (tabindex) {
			element.setAttribute("tabindex", tabindex);
		} else {
			element.removeAttribute("tabindex");
		}
	}
}

export {
	getTabbableOptions,
	getTabbableIn,
	getNextTabbable,
	getPreviousTabbable,
	isOutsideEvent,
	disableFocusInside,
	enableFocusInside,
};
