<script lang="ts">
	import { fly } from 'svelte/transition';
	// State
	import { drawer } from '$docs/stores.svelte';
	// Components
	import Navigation from '$docs/components/Navigation/Navigation.svelte';
	import PageHeader from '$docs/components/PageHeader/PageHeader.svelte';
	import PageFooter from '$docs/components/PageFooter/PageFooter.svelte';

	// Props
	let { children } = $props();

	function onBackdropClick(event: MouseEvent) {
		const elemTarget = event.target as HTMLElement;
		if (elemTarget.hasAttribute('data-dismiss')) drawer.toggle();
	}

	function onWindowResize() {
		if (drawer.value === true) drawer.close();
	}
</script>

<!-- Window -->
<svelte:window on:resize={onWindowResize} />

<!-- Overlay: Drawer -->
{#if drawer.value === true}
	<!-- transition:fade={{ duration: 200 }} -->
	<button
		class="fixed top-0 left-0 right-0 bottom-0 z-50"
		onclick={onBackdropClick}
		data-dismiss
		transition:fly={{ x: '-288px', duration: 200 }}
	>
		<Navigation classes="shadow-xl" />
	</button>
{/if}

<!-- Layout -->
<div>
	<!-- Navigation -->
	<Navigation classes="hidden lg:block " />
	<!-- Main -->
	<main class="ml-0 lg:ml-72" data-pagefind-body>
		<!-- Page Header -->
		<PageHeader />
		<!-- Page Content -->
		<article id="page-container" class="container p-10 text-lg mx-auto lg:ml-auto lg:px-32">
			{@render children()}
		</article>
		<!-- Page Footer -->
		<PageFooter />
	</main>
	<!-- Table of Contents -->
	<!-- <div class="fixed top-0 right-0 bottom-0 z-0 w-72 p-4 overflow-y-auto no-scrollbar"></div> -->
</div>
