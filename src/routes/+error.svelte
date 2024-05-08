<script lang="ts">
	import { page } from '$app/stores';
	import Logo from '$docs/components/Logo/Logo.svelte';
</script>

{#if $page}
	<div class="h-screen flex justify-center items-center">
		<div class="flex flex-col items-center space-y-8">
			<Logo />
			<h2 class="h2">
				{$page.status} - {#if $page.error}
					{$page.error.message}
				{/if}
			</h2>
			<p>We're sorry, something went wrong.</p>
		</div>
	</div>
{/if}
