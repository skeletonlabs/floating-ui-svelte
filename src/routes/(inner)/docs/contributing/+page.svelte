<script lang="ts">
	import CodeBlock from '$docs/components/CodeBlock/CodeBlock.svelte';
</script>

<div class="space-y-10">
	<!-- Header -->
	<header class="card card-gradient space-y-8">
		<h1 class="h1"><span>Contributing</span></h1>
		<p>Lorem, ipsum dolor sit amet consectetur adipisicing elit.</p>
	</header>
	<!-- Foo -->
	<section class="space-y-8">
		<p>
			This project is a SvelteKit project. The documentation site resides in `/routes` and the
			library in `/lib`.
		</p>
		<ul class="ul">
			<li>Fork and clone the repo</li>
			<li>Install dependencies in root directory with <code class="code">pnpm install</code></li>
			<li>Build initial package dist files with pnpm run build</li>
		</ul>
		<h2 class="h2">Testing grounds</h2>
		DOM pnpm run dev --filter @floating-ui/dom in the root will launch the @floating-ui/dom development
		visual tests at http://localhost:1234. The playground uses React to write each test route, bundled
		by Vite. Each route has screenshots taken of the page by Playwright to ensure all the functionalities
		work as expected; this is an easy, reliable and high-level way of testing the positioning logic.
		Below the main container are UI controls to turn on certain state and options. Every single combination
		of state is tested visually via the snapshots to cover as much as possible. React pnpm run dev --filter
		@floating-ui/react in the root will launch the @floating-ui/react development tests at http://localhost:1234.
	</section>
</div>
