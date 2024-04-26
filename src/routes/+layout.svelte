<script lang="ts">
	import '../app.pcss';
	// State
	import { drawer } from '$lib/stores.svelte';
	// Components
	import Navigation from '$lib/components/Navigation/Navigation.svelte';
	import PageHeader from '$lib/components/PageHeader/PageHeader.svelte';
	import Footer from '$lib/components/Footer/Footer.svelte';

	// Props
	let { children } = $props();

	function onBackdropClick(event: MouseEvent) {
		const elemTarget = event.target as HTMLElement;
		if (elemTarget.hasAttribute('data-dismiss')) drawer.toggle();
	}
</script>

<!-- Overlay: Drawer -->
{#if drawer.value === true}
	<button
		class="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50"
		onclick={onBackdropClick}
		data-dismiss
	>
		<Navigation />
	</button>
{/if}

<div>
	<!-- Navigation -->
	<Navigation classes="hidden lg:block " />
	<!-- Main -->
	<main class="ml-0 lg:ml-72">
		<!-- Page Header -->
		<PageHeader />
		<!-- Page Content -->
		<article id="page-container" class="container p-10 text-lg mx-auto lg:ml-auto lg:px-32">
			{@render children()}
		</article>
		<!-- Page Footer -->
		<Footer />
	</main>
	<!-- Table of Contents -->
	<!-- <div class="fixed top-0 right-0 bottom-0 z-0 w-72 p-4 overflow-y-auto no-scrollbar"></div> -->
</div>
