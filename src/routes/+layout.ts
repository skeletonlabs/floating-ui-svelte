import { getHighlighter } from 'shiki';
import MoonlightDark from '$docs/themes/moonlight-dark.json';
import MoonlightLight from '$docs/themes/moonlight-light.json';

export async function load() {
	const highlighter = await getHighlighter({
		langs: ['svelte', 'html', 'css', 'javascript', 'typescript', 'bash'],
		// @ts-expect-error - Shiki theme type is annoyingly strict
		themes: [MoonlightDark, MoonlightLight]
	});

	return {
		highlighter
	};
}

export const prerender = true;
