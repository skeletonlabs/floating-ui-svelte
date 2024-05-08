<script lang="ts">
	import { page } from '$app/stores';
	import Logo from '$docs/components/Logo/Logo.svelte';

	// FIXME: Remove when Svelte 5 supports $page,
	// see: https://github.com/sveltejs/eslint-plugin-svelte/issues/652
	// eslint-disable-next-line svelte/valid-compile
	const pageStatus = () => String($page.status);
	// eslint-disable-next-line svelte/valid-compile
	const pageErrorMessage = () => String($page.error!.message);
</script>

{#if $page}
	<div class="h-screen flex justify-center items-center">
		<div class="flex flex-col items-center space-y-8">
			<Logo />
			<h2 class="h2">
				{pageStatus()} - {#if pageErrorMessage()}{pageErrorMessage()}{/if}
			</h2>
			<p>We're sorry, something went wrong.</p>
		</div>
	</div>
{/if}
