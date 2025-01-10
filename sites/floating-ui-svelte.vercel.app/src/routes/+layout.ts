import { browser } from "$app/environment";
import getLatestVersion from "latest-version";
import type { Pagefind } from "vite-plugin-pagefind/types";

export async function load() {
	const version = await getLatestVersion("@skeletonlabs/floating-ui-svelte");
	if (browser) {
		// @ts-expect-error - Dynamic import
		const pagefind: Pagefind = await import("/pagefind/pagefind.js");
		await pagefind.init();
		return {
			version,
			pagefind,
		};
	}
	return {
		version,
	};
}

export const prerender = true;
