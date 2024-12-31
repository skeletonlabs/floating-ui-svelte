import type { PropertiesHyphen } from "csstype";

function styleObjectToString(styleObject: PropertiesHyphen) {
	return Object.entries(styleObject)
		.map(([key, value]) => `${key}: ${value};`)
		.join(" ");
}

export { styleObjectToString };
