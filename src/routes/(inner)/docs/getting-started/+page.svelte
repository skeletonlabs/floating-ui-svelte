<script lang="ts">
	import CodeBlock from '$docs/components/CodeBlock/CodeBlock.svelte';
</script>

<div class="space-y-10">
	<!-- Header -->
	<header class="card card-gradient space-y-8">
		<h1 class="h1"><span>Getting Started</span></h1>
		<p>
			<strong>Floating UI Svelte</strong> is a library that helps you create floating elements such as
			tooltips, popovers, dropdowns, and more.
		</p>
	</header>
	<!-- Supports -->
	<section class="space-y-8">
		<h2 class="h2">Support</h2>
		<!-- prettier-ignore -->
		<p>
			Floating UI Svelte currently supports Svelte projects built with <a class="anchor" href="https://kit.svelte.dev/" target="_blank">SvelteKit</a>, <a class="anchor" href="https://vitejs.dev/" target="_blank">Vite/Svelte</a>, or <a class="anchor" href="https://astro.build/" target="_blank">Astro</a>.
		</p>
	</section>
	<!-- Install -->
	<section class="space-y-8">
		<h2 class="h2">Install</h2>
		<p>To install Floating UI, you can use a package manager like npm, pnpm, or yarn.</p>
		<CodeBlock lang="bash" code={`npm install @skeletonlabs/floating-ui-svelte`} />
	</section>
</div>
