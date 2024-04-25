<script>
	import '../app.pcss';
	import Navigation from '$lib/components/Navigation/Navigation.svelte';
</script>

<div>
	<!-- Navigation -->
	<Navigation />
	<!-- Main -->
	<!-- NOTE: set px-20 for ToC -->
	<main class="mx-72 py-10 pl-20">
		<!-- Page Content -->
		<slot />
	</main>
	<!-- Table of Contents -->
	<!-- <div class="fixed top-0 right-0 bottom-0 z-0 w-72 p-4 overflow-y-auto no-scrollbar">(ToC)</div> -->
</div>
