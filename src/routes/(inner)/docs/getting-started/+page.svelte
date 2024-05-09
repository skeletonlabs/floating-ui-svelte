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
			Supports <u>Svelte v5</u> projects created with <a class="anchor" href="https://kit.svelte.dev/" target="_blank">SvelteKit</a>, <a class="anchor" href="https://vitejs.dev/" target="_blank">Vite/Svelte</a>, or <a class="anchor" href="https://astro.build/" target="_blank">Astro</a>.
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
		<h3 class="h3">Making elements "float</h3>
		<p>
			The following styles must be applied to any and all floating elements. We recommend using a
			class as shown below. Note that Floating UI does not take an opinionated stance on z-index
			stacking.
		</p>
		<CodeBlock
			lang="css"
			code={`
.floating {
	width: max-content;
	position: absolute;
	top: 0;
	left: 0;
}
		`}
		/>
		<CodeBlock lang="html" code={`<div class="floating">Some floating element.</div>`} />
	</section>
</div>
