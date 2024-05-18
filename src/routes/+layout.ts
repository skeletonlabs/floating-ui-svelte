import { getHighlighter } from 'shiki';
import MoonlightDark from '$docs/themes/moonlight-dark.json';
import type { Pagefind } from '$docs/types.js';
import { browser } from '$app/environment';

export async function load() {
	const highlighter = await getHighlighter({
		langs: ['svelte', 'html', 'css', 'javascript', 'typescript', 'bash'],
		// @ts-expect-error - Shiki theme type is annoyingly strict
		themes: [MoonlightDark],
	});

	if (browser) {
		// @ts-expect-error - Pagefind will be present at runtime
		const pagefind: Pagefind = await import('/pagefind/pagefind.js');
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
