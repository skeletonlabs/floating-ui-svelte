<script lang="ts">
	// Stylesheets
	import '../app.pcss';
	import { page } from '$app/stores';
	import Overlay from '$docs/components/Overlay/Overlay.svelte';

	// Props
	let { children } = $props();

	const title = $derived.by(() => {
		// FIXME: https://github.com/sveltejs/eslint-plugin-svelte/issues/652
		// eslint-disable-next-line svelte/valid-compile
		const pathname = $page.url.pathname;
		const titleRaw = pathname === '/' ? 'Home' : pathname.split('/').pop() ?? 'Floating UI Svelte';
		return titleRaw.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	});
</script>

<svelte:head>
	<title>{title} | Floating UI Svelte</title>
</svelte:head>

<Overlay>
	{@render children()}
</Overlay>
