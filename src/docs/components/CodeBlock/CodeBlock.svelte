<script lang="ts">
	import MoonlightDark from '$docs/themes/moonlight-dark.json';
	import MoonlightLight from '$docs/themes/moonlight-light.json';
	import { page } from '$app/stores';
	import type { BuiltinLanguage, SpecialLanguage } from 'shiki';

	interface Props {
		code: string;
		lang: BuiltinLanguage | SpecialLanguage;
	}

	let { code, lang = 'text' }: Props = $props();

	const html = $derived(
		// eslint-disable-next-line svelte/valid-compile
		$page.data.highlighter.codeToHtml(code.trim(), {
			lang,
			themes: {
				// @ts-expect-error - Shiki theme type is annoyingly strict
				dark: MoonlightDark,
				// @ts-expect-error - Shiki theme type is annoyingly strict
				light: MoonlightLight
			}
		})
	);
</script>

<!-- svelte-ignore svelte/no-at-html-tags-->
{@html html}

<style lang="postcss">
	:global(.shiki) {
		@apply p-4 text-sm rounded-md whitespace-pre-wrap;
	}
</style>
