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
		$page.data.highlighter.codeToHtml(code, {
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

<div class="codeblock contents">
	<!-- svelte-ignore svelte/no-at-html-tags-->
	{@html html}
</div>

<style lang="postcss">
	.codeblock :global(pre) {
		@apply p-4 rounded-md text-sm;
	}
</style>
