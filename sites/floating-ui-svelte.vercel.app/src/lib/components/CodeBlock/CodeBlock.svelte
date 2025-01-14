<script lang="ts" module>
import MoonlightDark from "$lib/themes/moonlight-dark.json";
import type {
	BuiltinLanguage,
	SpecialLanguage,
	ThemeRegistration,
} from "shiki";
import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import css from "shiki/langs/css.mjs";
import html from "shiki/langs/html.mjs";
import svelte from "shiki/langs/svelte.mjs";
import ts from "shiki/langs/ts.mjs";

const highlighter = createHighlighterCoreSync({
	engine: createJavaScriptRegexEngine(),
	langs: [svelte, html, css, ts, bash],
	themes: [MoonlightDark as ThemeRegistration],
});
</script>

<script lang="ts">
interface Props {
	code: string;
	lang: BuiltinLanguage | SpecialLanguage;
	mark?: Array<number | [number, number]>;
}

let { code, lang = "text", mark = [] }: Props = $props();

const highlightedLineNumbers = $derived(
	mark.flatMap((mark) => {
		if (Array.isArray(mark)) {
			const [start, end] = mark;
			return Array.from({ length: end - start + 1 }, (_, i) => start + i);
		}
		return mark;
	}),
);

const renderedCode = $derived(
	highlighter.codeToHtml(code.trim(), {
		lang: lang,
		theme: MoonlightDark as ThemeRegistration,
		transformers: [
			/**
			 * This transformer adds the `highlighted` class to lines that are to be highlighted.
			 */
			{
				line(node, lineNumber) {
					if (!highlightedLineNumbers.includes(lineNumber)) {
						return;
					}
					this.addClassToHast(node, "highlighted");
				},
			},
		],
	}),
);

// Sets the language badge color
function setLangCss() {
	let color = "bg-surface-500 text-white";
	if (lang === "html") color = "bg-orange-700 text-white";
	if (lang === "css") color = "bg-blue-700 text-white";
	if (["ts", "js"].includes(lang)) color = "bg-yellow-400 text-black";
	if (lang === "svelte") color = "bg-orange-700 text-white";
	return color;
}
</script>

<!-- eslint-disable svelte/no-at-html-tags -->
<figure class="relative rounded-md overflow-hidden">
	<!-- Language -->
	<span
		class="absolute top-0 right-0 text-[10px] leading-none font-bold px-1 py-0.5 rounded-bl shadow {setLangCss()}"
	>
		{lang}
	</span>
	<!-- Rendered Code -->
	<div class="codeblock">{@html renderedCode}</div>
</figure>

<!-- eslint-enable svelte/no-at-html-tags -->

<style lang="postcss">
	.codeblock :global {
		.shiki {
			@apply py-6 text-sm rounded-md whitespace-pre-wrap;
		}
		.line {
			/** 
			* Horizontal padding is added per line instead of the container
			* so that highlights extend fully to the end of the codeblock
			*/
			@apply px-6 inline-block w-full;
		}
		.highlighted {
			@apply !bg-surface-500/25;
		}
		.highlighted > span {
			@apply !bg-transparent;
		}
	}
</style>
