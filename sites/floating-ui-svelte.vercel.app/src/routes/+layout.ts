import { browser } from "$app/environment";
import type { Pagefind } from "vite-plugin-pagefind/types";

async function getPageFind() {
	if (!browser) {
		return null;
	}
	// @ts-expect-error - File will be generated at build time
	const pagefind: Pagefind = await import("/pagefind/pagefind.js");
	await pagefind.init();
	return pagefind;
}

async function getLatestVersion(fetcher: typeof fetch) {
	const response = await fetcher("https://registry.npmjs.org/@skeletonlabs/floating-ui-svelte");
	const data = await response.json();
	const version = data["dist-tags"].latest;
	return version;
}

export async function load({ fetch }) {
	const version = getLatestVersion(fetch);
	const pagefind = await getPageFind();
	return {
		version: version,
		pagefind: pagefind
	};
}

export const prerender = true;
