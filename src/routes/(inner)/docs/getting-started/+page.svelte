<script lang="ts">
	import CodeBlock from '$docs/components/CodeBlock/CodeBlock.svelte';
	import SsrRaw from './ExampleSsr.svelte?raw';
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
		<h2 class="h2">Requirements</h2>
		<p>
			Supports projects created using <a class="anchor" href="https://svelte.dev/" target="_blank">
				Svelte v5
			</a>.
		</p>
	</section>
	<!-- Install -->
	<section class="space-y-8">
		<h2 class="h2">Install</h2>
		<p>To install Floating UI, use your package manager of choice.</p>
		<CodeBlock
			lang="bash"
			code={`
npm install @skeletonlabs/floating-ui-svelte
# pnpm install @skeletonlabs/floating-ui-svelte
# yarn install @skeletonlabs/floating-ui-svelte
# bun install @skeletonlabs/floating-ui-svelte
		`}
		/>
	</section>
	<!-- Usage -->
	<section class="space-y-8">
		<h2 class="h2">Usage</h2>
		<h3 class="h3">Making elements "float"</h3>
		<!-- prettier-ignore -->
		<p>
			At minimum, the following styles must be applied to all floating elements. This can be handled using a
			reusable CSS class. Note that Floating UI does not take an opinionated stance on <a href="https://floating-ui.com/docs/misc#z-index-stacking" target="_blank" class="anchor">z-index stacking</a>.
		</p>
		<CodeBlock
			lang="css"
			code={`
.floating {
	width: max-content;
	position: absolute; top: 0; left: 0;
	/* Your custom styles here */
}
		`}
		/>
		<CodeBlock lang="html" code={`<div class="floating">Some floating element.</div>`} />
	</section>
	<!-- Ceveats -->
	<section class="space-y-8">
		<h2 class="h2">Caveats</h2>
		<h3 class="h3">Server-Side Rendering (SSR)</h3>
		<p>
			When SSR is enabled and the floating element is visible upon page load it will first be
			positioned in the top left of your screen. It will remain until the position is calculated. To
			prevent this, you may utilize the <kbd class="kbd">isPositioned</kbd>
			prop returned from the
			<kbd class="kbd"><a class="anchor" href="/api/use-floating">useFloating</a></kbd> hook:
		</p>
		<CodeBlock lang="svelte" code={SsrRaw} />
	</section>
</div>
