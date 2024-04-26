<script lang="ts">
	import IconArrowRight from 'lucide-svelte/icons/arrow-right';
	import Logo from '$lib/components/Logo/Logo.svelte';
</script>

<div class="space-y-10">
	<header
		class="h-[75vh] flex flex-col justify-center items-center space-y-8 text-center text-balance"
	>
		<Logo />
		<h1 class="h1 text-black dark:text-white">Floating UI Svelte</h1>
		<p>A Svelte library for position floating elements and create interactions for them.</p>
		<div class="flex gap-4">
			<a href="/tooltips" class="btn-cta">
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
	</header>
</div>
