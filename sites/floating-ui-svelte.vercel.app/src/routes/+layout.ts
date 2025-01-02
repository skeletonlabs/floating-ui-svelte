import { browser } from "$app/environment";
import type { Pagefind } from "vite-plugin-pagefind/types";

export async function load() {
	if (browser) {
		// @ts-expect-error - Dynamic import
		const pagefind: Pagefind = await import("/pagefind/pagefind.js");
		await pagefind.init();
		return {
			pagefind,
		};
	}
}

export const prerender = true;
