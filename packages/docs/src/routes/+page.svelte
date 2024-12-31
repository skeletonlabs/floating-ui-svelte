<script lang="ts">
import Logo from "$lib/components/Logo/Logo.svelte";
import PageFooter from "$lib/components/PageFooter/PageFooter.svelte";
// Components
import PageHeader from "$lib/components/PageHeader/PageHeader.svelte";
import IconArrowRight from "lucide-svelte/icons/arrow-right";
// Icons
import IconAlert from "lucide-svelte/icons/triangle-alert";
</script>

<div class="h-screen space-y-10">
	<!-- Header -->
	<div>
		<PageHeader />
		<div class="bg-blue-500 text-white p-4 flex justify-center items-start gap-4">
			<span><IconAlert size="24px" /></span>
			<p>
				Floating UI Svelte is available in early access. Expect bugs, missing features, and
				incomplete documentation.
			</p>
		</div>
	</div>
	<!-- Content -->
	<main
		id="page-container"
		class="h-[calc(100%-350px)] flex flex-col justify-center items-center space-y-8 text-center text-balance"
	>
		<Logo />
		<h1 class="h1 text-black dark:text-white">Floating UI Svelte</h1>
		<p class="max-w-md">
			A Svelte library for position floating elements and handling interaction. Inspired by <a
				class="anchor"
				href="https://floating-ui.com/"
				target="_blank">Floating UI</a
			>.
		</p>
		<div class="flex gap-4">
			<a href="/docs/getting-started" class="btn-gradient">
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
