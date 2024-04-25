<script>
	import '../app.pcss';
	import Navigation from '$lib/components/Navigation/Navigation.svelte';
	import PageHeader from '$lib/components/PageHeader/PageHeader.svelte';
	import Footer from '$lib/components/Footer/Footer.svelte';
</script>

<div>
	<!-- Navigation -->
	<Navigation />
	<!-- Main -->
	<main class="ml-72">
		<!-- Page Header -->
		<PageHeader />
		<!-- Page Content -->
		<article id="page-container" class="container mx-auto p-10 lg:px-32 pb-32 text-lg">
			<slot />
		</article>
		<!-- Page Footer -->
		<Footer />
	</main>
	<!-- Table of Contents -->
	<!-- <div class="fixed top-0 right-0 bottom-0 z-0 w-72 p-4 overflow-y-auto no-scrollbar"></div> -->
</div>
