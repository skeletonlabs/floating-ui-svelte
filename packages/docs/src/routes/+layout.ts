import { browser } from "$app/environment";
import MoonlightDark from "$lib/themes/moonlight-dark.json";
import { getHighlighter } from "shiki";
import type { Pagefind } from "vite-plugin-pagefind/types";

export async function load() {
	const highlighter = await getHighlighter({
		langs: ["svelte", "html", "css", "javascript", "typescript", "bash"],
		// @ts-expect-error - Shiki theme type is annoyingly strict
		themes: [MoonlightDark],
	});

	if (browser) {
		// @ts-expect-error - Dynamic import
		const pagefind: Pagefind = await import("/pagefind/pagefind.js");
		await pagefind.init();
		return {
			highlighter,
			pagefind,
		};
	}

	return {
		highlighter,
	};
}

export const prerender = true;
