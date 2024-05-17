<script>
	import CodeBlock from '$docs/components/CodeBlock/CodeBlock.svelte';
	import Preview from '$docs/components/Preview/Preview.svelte';
	import Example from './Example.svelte';
	import ExampleRaw from './Example.svelte?raw';
</script>

<div class="space-y-10">
	<!-- Header -->
	<header class="card card-gradient space-y-8">
		<h1 class="h1"><span>Context Menus</span></h1>
		<p>Coming Soon!</p>
	</header>

	<!-- Example -->
	<section class="space-y-8">
		<Preview>
			{#snippet preview()}<Example />{/snippet}
			{#snippet code()}<CodeBlock code={ExampleRaw} lang="svelte" />{/snippet}
		</Preview>
	</section>
</div>
