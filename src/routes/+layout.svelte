<script lang="ts">
	// Stylesheets
	import '../app.pcss';
	import { page } from '$app/stores';
	import Overlay from '$docs/components/Overlay/Overlay.svelte';
	import { setDrawer } from '$docs/stores.svelte.js';
	import Navigation from '$docs/components/Navigation/Navigation.svelte';
	import Dialog from '$docs/components/Dialog/Dialog.svelte';

	// Props
	let { children } = $props();

	const title = $derived.by(() => {
		// FIXME: https://github.com/sveltejs/eslint-plugin-svelte/issues/652
		// eslint-disable-next-line svelte/valid-compile
		const pathname = $page.url.pathname;
		const titleRaw = pathname === '/' ? 'Home' : pathname.split('/').pop() ?? 'Floating UI Svelte';
		return titleRaw.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	});

	const drawer = setDrawer(
		(() => {
			let open = $state(false);
			return {
				get open() {
					return open;
				},
				set open(value) {
					open = value;
				},
			};
		})(),
	);
</script>

<svelte:head>
	<title>{title} | Floating UI Svelte</title>
</svelte:head>

<Overlay>
	<!-- Overlay: Drawer -->
	<Dialog bind:open={drawer.open}>
		<Navigation />
	</Dialog>

	{@render children()}
</Overlay>
