<script lang="ts">
	// Components
	import PageHeader from '$docs/components/PageHeader/PageHeader.svelte';
	import Logo from '$docs/components/Logo/Logo.svelte';
	import PageFooter from '$docs/components/PageFooter/PageFooter.svelte';
	// Icons
	import IconArrowRight from 'lucide-svelte/icons/arrow-right';
</script>

<div class="h-screen space-y-10">
	<!-- Header -->
	<PageHeader />
	<!-- Content -->
	<main
		class="h-[calc(100%-250px)] flex flex-col justify-center items-center space-y-8 text-center text-balance"
	>
		<Logo />
		<h1 class="h1 text-black dark:text-white">Floating UI Svelte</h1>
		<p class="max-w-md">
			A Svelte library for position floating elements and handling interaction. Inspired by <a
				class="anchor"
				href="https://floating-ui.com/"
				target="_blank">Floating UI</a
			>
		</p>
		<div class="flex gap-4">
			<a href="/docs/getting-started" class="btn-cta">
				<span>Get Started</span>
				<IconArrowRight />
			</a>
			<a
				href="https://github.com/skeletonlabs/floating-ui-svelte"
				target="_blank"
				class="btn-neutral"
			>
				GitHub
			</a>
		</div>
	</main>
	<!-- Footer -->
	<PageFooter />
</div>
