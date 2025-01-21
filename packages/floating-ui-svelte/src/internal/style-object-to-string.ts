import type { PropertiesHyphen } from "csstype";
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

export { styleObjectToString, styleStringToObject };
