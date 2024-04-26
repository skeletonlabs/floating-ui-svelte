<script>
	import '../app.pcss';
	// State
	import { createDrawer } from '$lib/stores.svelte';
	// Components
	import Navigation from '$lib/components/Navigation/Navigation.svelte';
	import PageHeader from '$lib/components/PageHeader/PageHeader.svelte';
	import Footer from '$lib/components/Footer/Footer.svelte';

	// Props
	let { children } = $props();

	// Local
	const drawer = createDrawer();
	$inspect(drawer);
</script>

<!-- Overlay: Drawer -->
{#if drawer.value === true}
	<div class="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50">
		<Navigation />
	</div>
{/if}

<div>
	<!-- Navigation -->
	<Navigation />
	<!-- Main -->
	<main class="ml-0 lg:ml-72">
		<!-- Page Header -->
		<PageHeader />
		<!-- Page Content -->
		<article id="page-container" class="container p-10 text-lg mx-auto lg:ml-auto lg:px-32">
			<!-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->
			<pre class="pre mb-10">{drawer.value}</pre>
			<!-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->
			{@render children()}
		</article>
		<!-- Page Footer -->
		<Footer />
	</main>
	<!-- Table of Contents -->
	<!-- <div class="fixed top-0 right-0 bottom-0 z-0 w-72 p-4 overflow-y-auto no-scrollbar"></div> -->
</div>
