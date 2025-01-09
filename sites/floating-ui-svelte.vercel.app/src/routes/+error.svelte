<script lang="ts">
import { page } from "$app/state";
import Logo from "$lib/components/Logo/Logo.svelte";

const status = $derived(page.status);
const message = $derived(page.error ? page.error.message : "Unknown error");
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
