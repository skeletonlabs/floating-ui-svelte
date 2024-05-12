<script lang="ts">
	import MoonlightDark from '$docs/themes/moonlight-dark.json';
	import { page } from '$app/stores';
	import type { BuiltinLanguage, SpecialLanguage } from 'shiki';

	interface Props {
		code: string;
		lang: BuiltinLanguage | SpecialLanguage;
	}

	// Props
	let { code, lang = 'text' }: Props = $props();

	// Process Language
	const renderedCode = $derived(
		// FIXME: https://github.com/sveltejs/eslint-plugin-svelte/issues/652
		// eslint-disable-next-line svelte/valid-compile
		$page.data.highlighter.codeToHtml(code.trim(), {
			lang,
			themes: {
				// @ts-expect-error - Shiki theme type is annoyingly strict
				dark: MoonlightDark,
				// @ts-expect-error - Shiki theme type is annoyingly strict
				light: MoonlightDark,
			},
		}),
	);

	// Sets the language badge color
	function setLangCss() {
		let color = 'bg-surface-500 text-white';
		if (lang === 'html') color = 'bg-orange-700 text-white';
		if (lang === 'css') color = 'bg-blue-700 text-white';
		if (['ts', 'js'].includes(lang)) color = 'bg-yellow-400 text-black';
		if (lang === 'svelte') color = 'bg-orange-700 text-white';
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
	<div>{@html renderedCode}</div>
</figure>

<!-- eslint-enable svelte/no-at-html-tags -->

<style lang="postcss">
	:global(pre.shiki) {
		@apply p-6 text-sm rounded-md whitespace-pre-wrap;
	}
</style>
