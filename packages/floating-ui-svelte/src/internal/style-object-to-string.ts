import type { Properties, PropertiesHyphen } from "csstype";
import { error } from "./log.js";
import parse from "style-to-object";

function styleObjectToString(styleObject: PropertiesHyphen) {
	return Object.entries(styleObject)
		.map(([key, value]) => `${key}: ${value};`)
		.join(" ");
}

function styleStringToObject(
	style: string | null | undefined,
): PropertiesHyphen {
	if (!style) return {};
	try {
		return parse(style) as PropertiesHyphen;
	} catch (err) {
		error("Invalid style string provided via `style` prop. No styles applied.");
		return {};
	}
}

type MergeStylesArg = string | PropertiesHyphen | null | undefined;

function mergeStyles<T extends MergeStylesArg[]>(
	...args: T
): string | undefined {
	const mergedStyleObj: PropertiesHyphen = {};

	for (const arg of args) {
		if (arg === null) continue;
		if (typeof arg === "string") {
			Object.assign(mergedStyleObj, styleStringToObject(arg));
		} else if (arg) {
			Object.assign(mergedStyleObj, arg);
		}
	}

	return styleObjectToString(mergedStyleObj);
}

export { styleObjectToString, styleStringToObject, mergeStyles };
