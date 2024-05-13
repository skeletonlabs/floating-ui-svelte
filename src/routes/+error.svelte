<script lang="ts">
	import { page } from '$app/stores';
	import Logo from '$docs/components/Logo/Logo.svelte';

	// FIXME: https://github.com/sveltejs/eslint-plugin-svelte/issues/652
	// eslint-disable-next-line svelte/valid-compile
	const status = $derived($page.status);
	// eslint-disable-next-line svelte/valid-compile
	const message = $derived($page.error ? $page.error.message : 'Unknown error');
</script>

<svelte:head>
	<title>{status} | Floating UI Svelte</title>
</svelte:head>

<div class="h-screen flex justify-center items-center">
	<div class="flex flex-col items-center space-y-8">
		<Logo />
		<h2 class="h2">
			{status} - {message}
		</h2>
		<p>We're sorry, something went wrong.</p>
	</div>
</div>
