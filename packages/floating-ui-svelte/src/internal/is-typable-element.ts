import { isHTMLElement } from "@floating-ui/utils/dom";

const TYPEABLE_SELECTOR =
	"input:not([type='hidden']):not([disabled])," +
	"[contenteditable]:not([contenteditable='false']),textarea:not([disabled])";

function isTypeableElement(element: unknown): boolean {
	return isHTMLElement(element) && element.matches(TYPEABLE_SELECTOR);
}

export { TYPEABLE_SELECTOR, isTypeableElement };
