<script lang="ts">
// Stylesheets
import "../app.pcss";
import { page } from "$app/state";
import Dialog from "$lib/components/Dialog/Dialog.svelte";
import Navigation from "$lib/components/Navigation/Navigation.svelte";
import Overlay from "$lib/components/Overlay/Overlay.svelte";
import { setDrawer } from "$lib/stores.svelte.js";

// Props
let { children } = $props();

const title = $derived.by(() => {
	const pathname = page.url.pathname;
	const titleRaw =
		pathname === "/"
			? "Home"
			: (pathname.split("/").pop() ?? "Floating UI Svelte");
	return titleRaw.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
	<Dialog bind:open={drawer.open} type="drawer">
		<Navigation />
	</Dialog>

	{@render children()}
</Overlay>
