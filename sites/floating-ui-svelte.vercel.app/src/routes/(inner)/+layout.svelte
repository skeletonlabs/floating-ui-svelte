<script lang="ts">
// Components
import Navigation from "$lib/components/Navigation/Navigation.svelte";
import PageFooter from "$lib/components/PageFooter/PageFooter.svelte";
import PageHeader from "$lib/components/PageHeader/PageHeader.svelte";

// Props
let { children } = $props();
</script>

<!-- Layout -->
<div>
	<!-- Navigation -->
	<Navigation classes="hidden lg:block " />
	<!-- Main -->
	<main class="ml-0 lg:ml-72">
		<!-- Page Header -->
		<PageHeader />
		<!-- Page Content -->
		<article
			id="page-container"
			class="container p-10 text-lg mx-auto lg:ml-auto lg:px-32"
			data-pagefind-body
		>
			{@render children()}
		</article>
		<!-- Page Footer -->
		<PageFooter />
	</main>
	<!-- Table of Contents -->
	<!-- <div class="fixed top-0 right-0 bottom-0 z-0 w-72 p-4 overflow-y-auto no-scrollbar"></div> -->
</div>
